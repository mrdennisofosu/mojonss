import json

from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt

from . import content_views as cv
from .models import Announcement, AnnouncementRead, Profile, SupportRead, SupportReply, SupportRequest
from .permissions import is_staff_member


def iso(value):
    return value.isoformat() if value else None


def baselines(user):
    """Anything older than these moments counts as already seen. Set the first time they are needed."""
    profile, _ = Profile.objects.get_or_create(user=user)
    now = timezone.now()
    changed = []

    if profile.support_seen_at is None:
        profile.support_seen_at = now
        changed.append("support_seen_at")
    if profile.announcements_seen_at is None:
        profile.announcements_seen_at = now
        changed.append("announcements_seen_at")
    if changed:
        profile.save(update_fields=changed)

    return profile.support_seen_at, profile.announcements_seen_at


# ---------- Support ----------

def message_times(user):
    """Messages written by the OTHER side, as {request_id: [time, time, ...]}.

    Admins: each user's request itself, and each user's replies.
    Users:  an admin's replies to their own requests.
    """
    times = {}

    if is_staff_member(user):
        for request_id, created_at in (
            SupportRequest.objects.exclude(user=user).values_list("id", "created_at")
        ):
            times.setdefault(request_id, []).append(created_at)
        replies = SupportReply.objects.filter(is_staff_reply=False).exclude(request__user=user)
    else:
        replies = SupportReply.objects.filter(request__user=user, is_staff_reply=True)

    for request_id, created_at in replies.values_list("request_id", "created_at"):
        times.setdefault(request_id, []).append(created_at)

    return times


def support_state(user):
    """Returns ({request_id: unread_messages}, time_of_newest_message).

    A message is unread until its request has been opened after the message was written.
    """
    support_baseline, _ = baselines(user)
    opened = dict(SupportRead.objects.filter(user=user).values_list("request_id", "seen_at"))

    counts = {}
    latest = None

    for request_id, times in message_times(user).items():
        newest = max(times)
        if latest is None or newest > latest:
            latest = newest

        threshold = max(support_baseline, opened.get(request_id, support_baseline))
        unread = sum(1 for created_at in times if created_at > threshold)
        if unread:
            counts[request_id] = unread

    return counts, latest


# ---------- Announcements ----------

def announcement_summary(user):
    _, announcements_baseline = baselines(user)
    latest = (
        Announcement.objects.filter(status="published")
        .order_by("-published_at")
        .values_list("published_at", flat=True)
        .first()
    )

    # Admins write the announcements, so only users get a number
    if is_staff_member(user):
        return {"count": 0, "latest": iso(latest)}

    count = (
        Announcement.objects.filter(status="published", published_at__gt=announcements_baseline)
        .exclude(reads__user=user)
        .count()
    )
    return {"count": count, "latest": iso(latest)}


# ---------- Views ----------

def badges_view(request):
    """GET: the numbers shown in the sidebar, plus a 'latest' marker the pages use to notice new activity."""
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Unauthorized"}, status=401)

    user = request.user
    counts, latest = support_state(user)
    return JsonResponse({
        "support": {"count": sum(counts.values()), "latest": iso(latest)},
        "announcements": announcement_summary(user),
    })


@csrf_exempt
def support_read_view(request, request_id):
    """POST: this person opened this support request, so its messages are now read."""
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Unauthorized"}, status=401)
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    support = SupportRequest.objects.filter(id=request_id).first()
    if support is None:
        return JsonResponse({"error": "Support request not found"}, status=404)
    if support.user != request.user and not is_staff_member(request.user):
        return JsonResponse({"error": "Forbidden"}, status=403)

    SupportRead.objects.update_or_create(
        user=request.user,
        request=support,
        defaults={"seen_at": timezone.now()},
    )

    counts, _ = support_state(request.user)
    return JsonResponse({"status": "success", "count": sum(counts.values())})


def with_unread_flags(request, response):
    """Adds "unreadCount" (and "unread") to every item of a support list, for the signed-in person."""
    if response.status_code != 200 or not request.user.is_authenticated:
        return response

    try:
        data = json.loads(response.content)
    except ValueError:
        return response

    items = data.get("items") if isinstance(data, dict) else None
    if not isinstance(items, list):
        return response

    counts, _ = support_state(request.user)
    for item in items:
        unread = counts.get(item.get("id"), 0)
        item["unreadCount"] = unread
        item["unread"] = unread > 0
    return JsonResponse(data)


@csrf_exempt
def support_collection_with_unread(request):
    """Same as the support list (GET) and create (POST), with unread counts on the list."""
    response = cv.support_collection_view(request)
    return with_unread_flags(request, response) if request.method == "GET" else response


def my_support_with_unread(request):
    """Same as the person's own support list, with unread counts."""
    return with_unread_flags(request, cv.my_support_requests_self_view(request))


def published_announcement_with_read(request, announcement_id):
    """Same as opening one published announcement; a signed-in reader also marks it as read."""
    response = cv.published_announcement_view(request, announcement_id)

    if response.status_code == 200 and request.user.is_authenticated:
        AnnouncementRead.objects.get_or_create(user=request.user, announcement_id=announcement_id)

    return response