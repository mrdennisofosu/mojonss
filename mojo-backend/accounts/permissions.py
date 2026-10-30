# One place that answers "what level is this person, and what may they do?"

SUPER_ADMIN = "super_admin"
ADMIN = "admin"
USER = "user"

LEVEL_LABELS = {
    SUPER_ADMIN: "Super Admin",
    ADMIN: "Admin",
    USER: "User",
}


def level_of(user):
    """'super_admin', 'admin', 'user', or None when nobody is signed in."""
    if not user or not user.is_authenticated:
        return None

    profile = getattr(user, "profile", None)

    if user.is_superuser:
        return SUPER_ADMIN
    if profile and profile.role == "admin" and profile.is_super_admin:
        return SUPER_ADMIN
    if user.is_staff or (profile and profile.role == "admin"):
        return ADMIN
    return USER


def is_super_admin(user):
    return level_of(user) == SUPER_ADMIN


def is_staff_member(user):
    """Super admins and admins: anyone who may use the admin pages."""
    return level_of(user) in (SUPER_ADMIN, ADMIN)


def can_manage(actor, target):
    """Super admins manage everyone. Admins manage normal users only."""
    actor_level = level_of(actor)
    if actor_level == SUPER_ADMIN:
        return True
    if actor_level == ADMIN:
        return level_of(target) == USER
    return False