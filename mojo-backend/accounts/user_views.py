import json
import secrets

from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from .models import Profile
from .settings_views import read_setting
from .views import full_name, is_admin, log_activity

# No look-alike characters (0/O, 1/l/I), so a password is easy to read out loud
PASSWORD_LETTERS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz"
PASSWORD_DIGITS = "23456789"


def read_json(request):
    try:
        return json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return {}


def make_temporary_password():
    """Random password: at least 12 characters, and never shorter than the
    minimum password length set in System Settings. It always has an upper-case
    letter, a lower-case letter and a digit."""
    length = max(12, int(read_setting("minPasswordLength")))
    alphabet = PASSWORD_LETTERS + PASSWORD_DIGITS
    while True:
        password = "".join(secrets.choice(alphabet) for _ in range(length))
        if (
            any(c.islower() for c in password)
            and any(c.isupper() for c in password)
            and any(c.isdigit() for c in password)
        ):
            return password


def split_name(text):
    """'Ama Mensah Owusu' -> ('Ama', 'Mensah Owusu')."""
    parts = (text or "").strip().split(None, 1)
    return (parts[0], parts[1] if len(parts) > 1 else "") if parts else ("", "")


def serialize_user(user):
    profile = getattr(user, "profile", None)
    return {
        "id": user.id,
        "fullName": full_name(user),
        "email": user.email,
        "role": profile.role if profile else "user",
        "status": profile.status if profile else "active",
        "createdAt": str(user.date_joined),
    }


@csrf_exempt
def create_user_view(request):
    """Admin only. Creates an account with a random temporary password.

    This works whether or not public registration is turned on.
    """
    if not is_admin(request.user):
        return JsonResponse({"error": "Forbidden"}, status=403)
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    data = read_json(request)
    full = (data.get("fullName") or "").strip()
    email = (data.get("email") or "").strip()
    role = data.get("role", "user")

    if not full:
        return JsonResponse({"error": "Enter the full name."}, status=400)
    if not email or "@" not in email:
        return JsonResponse({"error": "Enter a valid email address."}, status=400)
    if role not in ("admin", "user"):
        return JsonResponse({"error": "Role must be admin or user."}, status=400)
    if User.objects.filter(email__iexact=email).exists() or User.objects.filter(username__iexact=email).exists():
        return JsonResponse({"error": "An account with this email already exists."}, status=400)

    first_name, last_name = split_name(full)
    temporary_password = make_temporary_password()

    user = User.objects.create_user(
        username=email,
        email=email,
        password=temporary_password,
        first_name=first_name,
        last_name=last_name,
    )
    profile, _ = Profile.objects.get_or_create(user=user)
    profile.role = role
    profile.save()

    log_activity(request.user, "user_create", f"Created account for {email} with role {role}", request)
    return JsonResponse({"user": serialize_user(user), "temporaryPassword": temporary_password}, status=201)


@csrf_exempt
def user_detail_view(request, user_id):
    """Admin only. PATCH updates a person's name and email."""
    if not is_admin(request.user):
        return JsonResponse({"error": "Forbidden"}, status=403)
    if request.method != "PATCH":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    try:
        user = User.objects.select_related("profile").get(id=user_id)
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)

    data = read_json(request)

    if "fullName" in data:
        full = (data.get("fullName") or "").strip()
        if not full:
            return JsonResponse({"error": "Enter the full name."}, status=400)
        user.first_name, user.last_name = split_name(full)

    if "email" in data:
        email = (data.get("email") or "").strip()
        if not email or "@" not in email:
            return JsonResponse({"error": "Enter a valid email address."}, status=400)
        if User.objects.filter(email__iexact=email).exclude(id=user.id).exists():
            return JsonResponse({"error": "Another account already uses this email."}, status=400)
        user.email = email

    user.save()
    log_activity(request.user, "status_change", f"Updated details for {user.email}", request)
    return JsonResponse(serialize_user(user))