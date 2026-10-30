import json
import math

from django.contrib.auth.models import User
from django.contrib.sessions.models import Session
from django.db.models import Q
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from . import settings_views
from .models import Profile, UserSession
from .permissions import (
    ADMIN, LEVEL_LABELS, SUPER_ADMIN, USER,
    can_manage, is_staff_member, is_super_admin, level_of,
)
from .user_views import make_temporary_password, split_name
from .verification_views import logger, send_verification_email
from .views import full_name, log_activity

LEVELS = (SUPER_ADMIN, ADMIN, USER)

ADMIN_Q = Q(profile__role="admin") | Q(is_staff=True) | Q(is_superuser=True)
SUPER_Q = Q(is_superuser=True) | Q(profile__is_super_admin=True, profile__role="admin")


# ---------- Helpers ----------

def read_json(request):
    try:
        return json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return {}


def serialize_user(actor, target):
    profile = getattr(target, "profile", None)
    level = level_of(target)
    return {
        "id": target.id,
        "fullName": full_name(target),
        "email": target.email,
        "role": "admin" if level in (SUPER_ADMIN, ADMIN) else "user",
        "level": level,
        "levelLabel": LEVEL_LABELS[level],
        "status": profile.status if profile else "active",
        "emailVerified": bool(profile.email_verified) if profile else False,
        "createdAt": str(target.date_joined),
        "isSelf": actor.id == target.id,
        # Can the person asking change this account's role or status?
        "canManage": actor.id != target.id and can_manage(actor, target),
    }


def paginate_queryset(request, queryset, serialize, default_size=8):
    try:
        page = max(int(request.GET.get("page", 1)), 1)
    except ValueError:
        page = 1
    try:
        size = min(max(int(request.GET.get("pageSize", default_size)), 1), 50)
    except ValueError:
        size = default_size

    total = queryset.count()
    total_pages = max(math.ceil(total / size), 1)
    page = min(page, total_pages)
    start = (page - 1) * size

    return {
        "items": [serialize(obj) for obj in queryset[start:start + size]],
        "total": total,
        "page": page,
        "totalPages": total_pages,
        "pageSize": size,
    }


def end_all_sessions(user):
    """Signs the person out of every device."""
    keys = list(UserSession.objects.filter(user=user).values_list("session_key", flat=True))
    Session.objects.filter(session_key__in=keys).delete()
    UserSession.objects.filter(user=user).delete()


def apply_level(user, level):
    profile, _ = Profile.objects.get_or_create(user=user)
    profile.role = "user" if level == USER else "admin"
    profile.is_super_admin = level == SUPER_ADMIN
    profile.save()

    # Someone moved down to User must not keep Django-admin staff access
    if level == USER and user.is_staff and not user.is_superuser:
        user.is_staff = False
        user.save(update_fields=["is_staff"])


def forbidden(message):
    return JsonResponse({"error": message}, status=403)


# ---------- Users ----------

def list_users_view(request):
    if not is_staff_member(request.user):
        return forbidden("Forbidden")

    search = request.GET.get("search", "").strip()
    role = request.GET.get("role", "").strip()
    level = request.GET.get("level", "").strip()
    status = request.GET.get("status", "").strip()

    users = User.objects.select_related("profile").order_by("-date_joined")

    if search:
        users = users.filter(
            Q(email__icontains=search)
            | Q(username__icontains=search)
            | Q(first_name__icontains=search)
            | Q(last_name__icontains=search)
        )

    if role == "admin":
        users = users.filter(ADMIN_Q)
    elif role == "user":
        users = users.exclude(ADMIN_Q)

    if level == SUPER_ADMIN:
        users = users.filter(SUPER_Q)
    elif level == ADMIN:
        users = users.filter(ADMIN_Q).exclude(SUPER_Q)
    elif level == USER:
        users = users.exclude(ADMIN_Q)

    if status == "active":
        users = users.filter(Q(profile__status="active") | Q(profile__isnull=True))
    elif status in ("inactive", "pending"):
        users = users.filter(profile__status=status)

    actor = request.user
    return JsonResponse(paginate_queryset(request, users.distinct(), lambda target: serialize_user(actor, target)))


@csrf_exempt
def create_user_view(request):
    """Creates an account with a random temporary password, then emails a verification link.

    Super admins can create any level. Admins can only create normal users.
    """
    actor = request.user
    if not is_staff_member(actor):
        return forbidden("Forbidden")
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    data = read_json(request)
    full = (data.get("fullName") or "").strip()
    email = (data.get("email") or "").strip()
    level = data.get("level") or data.get("role") or USER

    if not full:
        return JsonResponse({"error": "Enter the full name."}, status=400)
    if not email or "@" not in email:
        return JsonResponse({"error": "Enter a valid email address."}, status=400)
    if level not in LEVELS:
        return JsonResponse({"error": "Choose Super Admin, Admin or User."}, status=400)
    if level != USER and not is_super_admin(actor):
        return forbidden("Only the super admin can create administrators.")
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
    apply_level(user, level)

    email_sent = True
    try:
        send_verification_email(user)
    except Exception:
        email_sent = False
        logger.exception("Could not send verification email to the new user %s", user.id)

    log_activity(actor, "user_create", f"Created {LEVEL_LABELS[level]} account for {email}", request)
    return JsonResponse({
        "user": serialize_user(actor, user),
        "temporaryPassword": temporary_password,
        "verificationEmailSent": email_sent,
    }, status=201)


@csrf_exempt
def update_user_view(request, user_id):
    """PATCH: change someone's name or email. Users cannot do this for themselves."""
    actor = request.user
    if not is_staff_member(actor):
        return forbidden("Forbidden")
    if request.method != "PATCH":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    try:
        user = User.objects.select_related("profile").get(id=user_id)
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)

    if not can_manage(actor, user):
        return forbidden("Only the super admin can edit administrators.")

    data = read_json(request)

    if "fullName" in data:
        full = (data.get("fullName") or "").strip()
        if not full:
            return JsonResponse({"error": "Enter the full name."}, status=400)
        user.first_name, user.last_name = split_name(full)

    email_changed = False
    if "email" in data:
        email = (data.get("email") or "").strip()
        if not email or "@" not in email:
            return JsonResponse({"error": "Enter a valid email address."}, status=400)
        if (
            User.objects.filter(email__iexact=email).exclude(id=user.id).exists()
            or User.objects.filter(username__iexact=email).exclude(id=user.id).exists()
        ):
            return JsonResponse({"error": "Another account already uses this email."}, status=400)

        if email.lower() != user.email.lower():
            email_changed = True
            if user.username.lower() == user.email.lower():
                user.username = email  # people sign in with their email, so keep them in step
            user.email = email

    user.save()

    if email_changed:
        profile, _ = Profile.objects.get_or_create(user=user)
        profile.email_verified = False  # the new address has not been confirmed
        profile.save(update_fields=["email_verified"])
        try:
            send_verification_email(user)
        except Exception:
            logger.exception("Could not send verification email to user %s", user.id)

    log_activity(actor, "status_change", f"Updated details for {user.email}", request)
    return JsonResponse(serialize_user(actor, user))


@csrf_exempt
def set_status_view(request, user_id):
    """PATCH {"status": "active" | "inactive" | "pending"}."""
    actor = request.user
    if not is_staff_member(actor):
        return forbidden("Forbidden")
    if request.method != "PATCH":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    try:
        user = User.objects.select_related("profile").get(id=user_id)
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)

    if user.id == actor.id:
        return forbidden("You cannot change the status of your own account.")
    if not can_manage(actor, user):
        return forbidden("Only the super admin can change the status of administrators.")

    status = read_json(request).get("status")
    if status not in ("active", "inactive", "pending"):
        return JsonResponse({"error": "Status must be active, inactive or pending."}, status=400)

    profile, _ = Profile.objects.get_or_create(user=user)
    profile.status = status
    profile.save(update_fields=["status"])

    if status == "inactive":
        end_all_sessions(user)  # they are signed out everywhere straight away

    log_activity(actor, "status_change", f"Set {user.email or user.username} to {status}", request)
    return JsonResponse({"status": "success", "user": serialize_user(actor, user)})


@csrf_exempt
def set_role_view(request, user_id):
    """PATCH {"role": "super_admin" | "admin" | "user"}. Super admins only."""
    actor = request.user
    if not is_staff_member(actor):
        return forbidden("Forbidden")
    if request.method != "PATCH":
        return JsonResponse({"error": "Method not allowed"}, status=405)
    if not is_super_admin(actor):
        return forbidden("Only the super admin can change roles.")

    try:
        user = User.objects.select_related("profile").get(id=user_id)
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)

    if user.id == actor.id:
        return forbidden("You cannot change your own role.")

    data = read_json(request)
    new_level = data.get("level") or data.get("role")
    if new_level not in LEVELS:
        return JsonResponse({"error": "Role must be super_admin, admin or user."}, status=400)

    if user.is_superuser and new_level != SUPER_ADMIN:
        return JsonResponse(
            {"error": "This account is a Django superuser. Change it in the Django admin site."},
            status=400,
        )

    apply_level(user, new_level)
    log_activity(actor, "role_change", f"Changed {user.email or user.username} to {LEVEL_LABELS[new_level]}", request)
    return JsonResponse({"status": "success", "user": serialize_user(actor, user)})


# ---------- System settings ----------

@csrf_exempt
def settings_gate_view(request):
    """Anyone can read the settings. Only the super admin can save them."""
    if request.method != "GET" and not is_super_admin(request.user):
        return forbidden("Only the super admin can change system settings.")
    return settings_views.settings_view(request)