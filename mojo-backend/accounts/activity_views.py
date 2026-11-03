import math
from datetime import date, datetime, time, timedelta
from functools import reduce
from operator import or_

from django.db.models import Q
from django.http import JsonResponse
from django.utils import timezone

from .models import ActivityLog
from .permissions import is_staff_member
from .views import full_name

ACTION_NAMES = [value for value, _label in ActivityLog.ACTION_CHOICES]

# Many different events are stored under the action "status_change".
# Their descriptions tell them apart.
ACCOUNT_STATUS_PATTERN = r"^Set .+ to (active|inactive|pending)( in admin)?$"

EMAIL_VERIFIED_Q = Q(action="status_change") & (
    Q(description__startswith="Email address verified")
    | (Q(description__startswith="Marked") & Q(description__contains="email address"))
)
PROFILE_UPDATED_Q = Q(action="status_change", description__startswith="Updated details for")
ACCOUNT_STATUS_Q = Q(action="status_change", description__regex=ACCOUNT_STATUS_PATTERN)

# The groups in the dropdown (value sent by the page -> which log rows it means)
GROUP_FILTERS = {
    "signins": Q(action="login"),
    "failed": Q(action="login_failed"),
    "passwords": Q(action="password_change"),
    "roles": Q(action="role_change"),
    "status": ACCOUNT_STATUS_Q,
    "registrations": Q(action="user_create") | EMAIL_VERIFIED_Q,
    "profile": PROFILE_UPDATED_Q,
    "sessions": Q(action="logout"),
    "support": Q(action__in=["support_request", "support_reply"]),
    "announcements": Q(action="announcement"),
}


def group_filter(group):
    """The rows a dropdown choice stands for. None means the choice is not known."""
    if group in GROUP_FILTERS:
        return GROUP_FILTERS[group]
    if group == "admin":
        # Administrative actions are everything the other groups do not cover
        return ~reduce(or_, GROUP_FILTERS.values())
    if group in ACTION_NAMES:  # a stored action name also works
        return Q(action=group)
    return None


def display_type(activity):
    """The label key the page uses for the Event column."""
    text = activity.description or ""

    if activity.action == "status_change":
        if text.startswith("Email address verified") or (
            text.startswith("Marked") and "email address" in text
        ):
            return "email_verified"
        if text.startswith("Updated details for"):
            return "profile_updated"
        if ACCOUNT_STATUS_Q and text.startswith("Set ") and any(
            text.endswith(end) for end in (" to active", " to inactive", " to pending",
                                           " to active in admin", " to inactive in admin", " to pending in admin")
        ):
            return "account_status"
        return "settings_changed"

    if activity.action == "logout" and text.startswith("Signed out"):
        return "session_revoked"

    return activity.action


def parse_day(value, label):
    """'2026-11-02' -> a date. Returns (date, error_message)."""
    if not value:
        return None, ""
    try:
        return date.fromisoformat(value), ""
    except ValueError:
        return None, f"{label} must be a date like 2026-11-02."


def start_of_day(day):
    return timezone.make_aware(datetime.combine(day, time.min))


def serialize_activity(activity):
    return {
        "id": activity.id,
        "user": activity.user.username,
        "actorName": full_name(activity.user),
        "actorEmail": activity.user.email,
        "description": activity.description,
        "type": display_type(activity),
        "createdAt": str(activity.created_at),
    }


def list_activities_view(request):
    """Activity log for admins: search, event group, date range and real paging."""
    if not is_staff_member(request.user):
        return JsonResponse({"error": "Forbidden"}, status=403)

    search = request.GET.get("search", "").strip()
    group = request.GET.get("group", "").strip()

    from_day, error = parse_day(request.GET.get("from", "").strip(), "From")
    if error:
        return JsonResponse({"error": error}, status=400)
    to_day, error = parse_day(request.GET.get("to", "").strip(), "To")
    if error:
        return JsonResponse({"error": error}, status=400)
    if from_day and to_day and from_day > to_day:
        return JsonResponse({"error": "The From date must not be after the To date."}, status=400)

    activities = ActivityLog.objects.select_related("user").order_by("-created_at", "-id")

    if search:
        activities = activities.filter(
            Q(description__icontains=search)
            | Q(user__username__icontains=search)
            | Q(user__email__icontains=search)
            | Q(user__first_name__icontains=search)
            | Q(user__last_name__icontains=search)
        )

    if group:
        wanted = group_filter(group)
        activities = activities.filter(wanted) if wanted is not None else activities.none()

    # The To day is included in full
    if from_day:
        activities = activities.filter(created_at__gte=start_of_day(from_day))
    if to_day:
        activities = activities.filter(created_at__lt=start_of_day(to_day + timedelta(days=1)))

    try:
        page = max(int(request.GET.get("page", 1)), 1)
    except ValueError:
        page = 1
    try:
        size = min(max(int(request.GET.get("pageSize", 10)), 1), 50)
    except ValueError:
        size = 10

    total = activities.count()
    total_pages = max(math.ceil(total / size), 1)
    page = min(page, total_pages)
    start = (page - 1) * size

    return JsonResponse({
        "items": [serialize_activity(a) for a in activities[start:start + size]],
        "total": total,
        "page": page,
        "totalPages": total_pages,
        "pageSize": size,
    })
