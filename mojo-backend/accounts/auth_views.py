import json

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from .models import ActivityLog, Profile, UserSession
from .permissions import LEVEL_LABELS, ADMIN, SUPER_ADMIN, level_of
from .settings_views import read_setting
from .views import full_name, log_activity, parse_device


def describe_user(user):
    """The signed-in person, as the frontend receives it.

    role  stays "admin" or "user" so existing route guards keep working.
    level is the detailed one: "super_admin", "admin" or "user".
    """
    profile = getattr(user, "profile", None)
    level = level_of(user)
    return {
        "id": user.id,
        "username": user.username,
        "fullName": full_name(user),
        "email": user.email,
        "role": "admin" if level in (SUPER_ADMIN, ADMIN) else "user",
        "level": level,
        "levelLabel": LEVEL_LABELS[level],
        "status": profile.status if profile else "active",
        "emailVerified": bool(profile.email_verified) if profile else False,
        "lastLogin": str(user.last_login),
        "createdAt": str(user.date_joined),
    }


@csrf_exempt
def login_view(request):
    if request.method != "POST":
        return JsonResponse({"status": "error", "error": "Method not allowed"}, status=405)

    try:
        data = json.loads(request.body or "{}")
        identifier = (data.get("username") or "").strip()
        password = (data.get("password") or "").strip()

        # People can sign in with their username or their email
        username_to_use = identifier
        if "@" in identifier:
            match = User.objects.filter(email__iexact=identifier).first()
            if match:
                username_to_use = match.username

        user = authenticate(request, username=username_to_use, password=password)

        if user is None:
            failed_user = User.objects.filter(username=username_to_use).first()
            if failed_user:
                log_activity(failed_user, "login_failed", "Failed sign-in attempt (wrong password)", request)
            return JsonResponse(
                {"status": "error", "code": "INVALID_CREDENTIALS", "error": "Invalid credentials"},
                status=401,
            )

        profile, _ = Profile.objects.get_or_create(user=user)
        level = level_of(user)

        # Deactivated accounts cannot sign in
        if profile.status == "inactive":
            log_activity(user, "login_failed", "Sign-in blocked: account is deactivated", request)
            return JsonResponse({
                "status": "error",
                "code": "ACCOUNT_DEACTIVATED",
                "error": "Your account has been deactivated. Please contact an administrator.",
            }, status=403)

        # Only when the admin turned the setting on. Super admins are exempt so nobody is locked out.
        if level != SUPER_ADMIN and not profile.email_verified and read_setting("requireEmailVerification"):
            log_activity(user, "login_failed", "Sign-in blocked: email is not verified", request)
            return JsonResponse({
                "status": "error",
                "code": "EMAIL_NOT_VERIFIED",
                "error": "Please verify your email address before signing in.",
            }, status=403)

        # Decide trust BEFORE logging this login, so we compare with earlier logins only
        ip = request.META.get("REMOTE_ADDR")
        has_history = ActivityLog.objects.filter(user=user, action="login").exists()
        known_ip = ActivityLog.objects.filter(user=user, action="login", ip_address=ip).exists()
        is_trusted = (not has_history) or known_ip

        login(request, user)

        if not request.session.session_key:
            request.session.save()

        UserSession.objects.update_or_create(
            session_key=request.session.session_key,
            defaults={
                "user": user,
                "device": parse_device(request.META.get("HTTP_USER_AGENT")),
                "ip_address": ip,
                "location": "Unknown",
                "is_trusted": is_trusted,
            },
        )

        log_activity(user, "login", "User logged in", request)
        return JsonResponse({"status": "success", **describe_user(user)}, status=200)

    except Exception as error:
        return JsonResponse({"status": "error", "error": str(error)}, status=500)


def user_status(request):
    user = request.user
    if not user.is_authenticated:
        return JsonResponse({"is_authenticated": False}, status=200)

    # An account deactivated while the person was signed in is signed out here
    profile = getattr(user, "profile", None)
    if profile and profile.status == "inactive":
        key = request.session.session_key
        if key:
            UserSession.objects.filter(session_key=key).delete()
        logout(request)
        return JsonResponse({"is_authenticated": False}, status=200)

    return JsonResponse({"is_authenticated": True, **describe_user(user)}, status=200)