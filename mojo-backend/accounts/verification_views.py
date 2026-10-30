import hashlib
import json
import logging
import secrets
from datetime import timedelta

from django.conf import settings
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt

from . import settings_views
from .models import EmailVerificationToken, Profile
from .settings_views import read_setting
from .views import log_activity

logger = logging.getLogger(__name__)

TOKEN_LIFETIME = timedelta(hours=24)
RESEND_WAIT = timedelta(seconds=60)


def read_json(request):
    try:
        return json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return {}


def hash_token(raw_token):
    return hashlib.sha256(raw_token.encode()).hexdigest()


def recently_sent(user):
    latest = user.verification_tokens.first()
    return bool(latest) and timezone.now() - latest.created_at < RESEND_WAIT


def send_verification_email(user):
    """Creates a fresh one-time link and emails it. Raises an error if the email cannot be sent."""
    if not user.email:
        raise ValueError("This account has no email address.")

    raw_token = secrets.token_urlsafe(32)
    user.verification_tokens.filter(used_at__isnull=True).delete()  # older links stop working
    EmailVerificationToken.objects.create(
        user=user,
        email=user.email,
        token_hash=hash_token(raw_token),
        expires_at=timezone.now() + TOKEN_LIFETIME,
    )

    link = f"{settings.FRONTEND_URL.rstrip('/')}/verify-email?token={raw_token}"
    app_name = read_setting("appName")
    name = user.first_name or user.username

    send_mail(
        subject=f"Verify your email address for {app_name}",
        message=(
            f"Hello {name},\n\n"
            f"Please confirm your email address by opening this link:\n\n{link}\n\n"
            "The link works for 24 hours and can be used once. "
            "If you did not expect this email, you can ignore it.\n"
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=False,
    )


@csrf_exempt
def send_my_verification_view(request):
    """A signed-in person asks for a verification email for their own address."""
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Unauthorized"}, status=401)
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    user = request.user
    profile, _ = Profile.objects.get_or_create(user=user)

    if profile.email_verified:
        return JsonResponse({"status": "already_verified", "message": "Your email is already verified."})
    if recently_sent(user):
        return JsonResponse({"error": "Please wait a minute before asking for another email."}, status=429)

    try:
        send_verification_email(user)
    except Exception:
        logger.exception("Could not send verification email to user %s", user.id)
        return JsonResponse({"error": "We could not send the email. Please try again later."}, status=500)

    return JsonResponse({"status": "success", "message": f"We sent a verification link to {user.email}."})


@csrf_exempt
def resend_verification_view(request):
    """Public. Always gives the same answer, so nobody can use it to find out who has an account."""
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    email = (read_json(request).get("email") or "").strip()
    user = User.objects.filter(email__iexact=email).first() if email else None

    if user:
        profile, _ = Profile.objects.get_or_create(user=user)
        if not profile.email_verified and not recently_sent(user):
            try:
                send_verification_email(user)
            except Exception:
                logger.exception("Could not send verification email to user %s", user.id)

    return JsonResponse({
        "status": "success",
        "message": "If an account exists for that email and it is not verified yet, we have sent a new link.",
    })


@csrf_exempt
def verify_email_view(request):
    """Public. The link from the email lands on the frontend, which posts the token here."""
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    invalid = JsonResponse({
        "status": "error",
        "code": "INVALID_TOKEN",
        "error": "This verification link is invalid or has expired. Please request a new one.",
    }, status=400)

    token = (read_json(request).get("token") or "").strip()
    if not token:
        return invalid

    record = EmailVerificationToken.objects.select_related("user").filter(token_hash=hash_token(token)).first()
    if record is None:
        return invalid

    user = record.user
    profile, _ = Profile.objects.get_or_create(user=user)

    # The link only counts for the address it was sent to
    if record.email.lower() != user.email.lower():
        return invalid

    if record.used_at is not None:
        # Opening the same link twice (or the page loading twice) should not show an error
        if profile.email_verified:
            return JsonResponse({"status": "success", "message": "Your email is already verified."})
        return invalid

    if record.expires_at < timezone.now():
        return invalid

    record.used_at = timezone.now()
    record.save(update_fields=["used_at"])
    profile.email_verified = True
    profile.save(update_fields=["email_verified"])

    log_activity(user, "status_change", "Email address verified", request)
    return JsonResponse({"status": "success", "message": "Your email has been verified."})


@csrf_exempt
def register_with_verification(request):
    """Public sign-up, then a verification email. The sign-up rules stay in settings_views."""
    response = settings_views.register_view(request)

    if response.status_code == 201:
        try:
            created = json.loads(response.content)
            user = User.objects.get(id=created["user"]["id"])
            send_verification_email(user)
        except Exception:
            logger.exception("Could not send verification email after sign-up")

    return response