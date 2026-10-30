import json

from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from .models import Profile, SystemSetting
from .views import full_name, is_admin, log_activity

# key -> default value. The type of the default decides how a saved value is read.
DEFAULTS = {
    "appName": "Mojo App",
    "supportEmail": "support@mojo.com",
    "publicRegistrationEnabled": True,
    "minPasswordLength": 8,
    "requireEmailVerification": False,
    "maxFailedAttempts": 5,
    "lockoutMinutes": 15,
    "sessionTimeoutMinutes": 30,
    "allowRememberMe": False,
}

# How the settings are grouped in the API response
GROUPS = {
    "general": ["appName", "supportEmail"],
    "registration": ["publicRegistrationEnabled"],
    "security": ["minPasswordLength", "requireEmailVerification", "maxFailedAttempts", "lockoutMinutes"],
    "session": ["sessionTimeoutMinutes", "allowRememberMe"],
}

TRUE_WORDS = ("true", "1", "yes", "on")
FALSE_WORDS = ("false", "0", "no", "off")


def read_json(request):
    try:
        return json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return {}


def read_setting(key):
    """Current value of a setting, falling back to its default when nothing is saved."""
    default = DEFAULTS[key]
    row = SystemSetting.objects.filter(key=key).first()
    if row is None or row.value.strip() == "":
        return default

    if isinstance(default, bool):
        return row.value.strip().lower() in TRUE_WORDS
    if isinstance(default, int):
        try:
            return int(row.value)
        except ValueError:
            return default
    return row.value


def build_settings():
    return {
        group: {key: read_setting(key) for key in keys}
        for group, keys in GROUPS.items()
    }


def coerce_setting(key, raw):
    """Check one incoming value and convert it to the right type."""
    default = DEFAULTS[key]

    if isinstance(default, bool):
        if isinstance(raw, bool):
            return raw
        word = str(raw).strip().lower()
        if word in TRUE_WORDS:
            return True
        if word in FALSE_WORDS:
            return False
        raise ValueError(f"{key} must be true or false.")

    if isinstance(default, int):
        try:
            number = int(raw)
        except (TypeError, ValueError):
            raise ValueError(f"{key} must be a whole number.")
        if number < 0:
            raise ValueError(f"{key} cannot be negative.")
        return number

    text = str(raw).strip()
    if not text:
        raise ValueError(f"{key} cannot be empty.")
    return text


def stored_text(value):
    if isinstance(value, bool):
        return "true" if value else "false"
    return str(value)


def public_settings_view(request):
    return JsonResponse({"settings": build_settings()}, status=200)


@csrf_exempt
def settings_view(request):
    """GET = anyone reads the settings. POST, PUT or PATCH = an admin saves them."""
    if request.method == "GET":
        return public_settings_view(request)

    if request.method not in ("POST", "PUT", "PATCH"):
        return JsonResponse({"error": "Method not allowed"}, status=405)
    if not is_admin(request.user):
        return JsonResponse({"error": "Forbidden"}, status=403)

    data = read_json(request)
    if isinstance(data.get("settings"), dict):
        data = data["settings"]

    # Accept flat values and grouped values
    incoming = {}
    for name, value in data.items():
        if name in DEFAULTS:
            incoming[name] = value
        elif name in GROUPS and isinstance(value, dict):
            for key, inner in value.items():
                if key in DEFAULTS:
                    incoming[key] = inner

    # Validate everything first, then save, so a bad value saves nothing
    cleaned = {}
    try:
        for key, raw in incoming.items():
            cleaned[key] = coerce_setting(key, raw)
    except ValueError as error:
        return JsonResponse({"error": str(error)}, status=400)

    for key, value in cleaned.items():
        SystemSetting.objects.update_or_create(key=key, defaults={"value": stored_text(value)})

    if cleaned:
        log_activity(request.user, "status_change", f"Updated system settings: {', '.join(cleaned)}", request)

    return JsonResponse({"status": "success", "settings": build_settings()}, status=200)


@csrf_exempt
def register_view(request):
    """Creates an account.

    Public registration ON:  anyone can register, always as a standard user.
    Public registration OFF: only a signed-in admin can create accounts, and only
                             an admin can choose the role.
    """
    if request.method != "POST":
        return JsonResponse({"status": "error", "error": "Method not allowed"}, status=405)

    staff = is_admin(request.user)
    if not staff and not read_setting("publicRegistrationEnabled"):
        return JsonResponse({
            "status": "error",
            "error": "Public registration is turned off. Please contact an administrator to create your account.",
        }, status=403)

    try:
        data = read_json(request)
        email = (data.get("email") or "").strip()
        username = (data.get("username") or email).strip()
        password = (data.get("password") or "").strip()

        # The Register page sends one "fullName"; split it into first and last name
        first_name = (data.get("firstName") or "").strip()
        last_name = (data.get("lastName") or "").strip()
        combined_name = (data.get("fullName") or "").strip()
        if combined_name and not (first_name or last_name):
            parts = combined_name.split(None, 1)
            first_name = parts[0]
            last_name = parts[1] if len(parts) > 1 else ""

        requested_role = data.get("role", "user")
        role = requested_role if staff and requested_role in ("admin", "user") else "user"

        if not username or not password:
            return JsonResponse({"status": "error", "error": "Username and password are required"}, status=400)
        if User.objects.filter(username=username).exists():
            return JsonResponse({"status": "error", "error": "Username already taken"}, status=400)
        if email and User.objects.filter(email__iexact=email).exists():
            return JsonResponse({"status": "error", "error": "An account with this email already exists"}, status=400)

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
        )
        profile, _ = Profile.objects.get_or_create(user=user)
        profile.role = role
        profile.save()

        if staff:
            log_activity(request.user, "user_create", f"Created account for {user.username} with role {role}", request)
        else:
            log_activity(user, "user_create", f"Account created with role {role}", request)

        return JsonResponse({
            "status": "success",
            "message": "User created successfully",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "fullName": full_name(user),
                "role": profile.role,
            },
        }, status=201)
    except Exception as error:
        return JsonResponse({"status": "error", "error": str(error)}, status=500)