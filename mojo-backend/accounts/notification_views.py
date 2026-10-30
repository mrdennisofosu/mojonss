from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt

from .models import Profile, SupportReply, SupportRequest
from .permissions import is_staff_member


def count_unread(user, seen_at):
    """Admins: new requests and user replies since they last looked.
    Users: admin replies to their own requests since they last looked."""
    if is_staff_member(user):
        new_requests = set(
            SupportRequest.objects.filter(created_at__gt=seen_at)
            .exclude(user=user)
            .values_list("id", flat=True)
        )
        user_replies = set(
            SupportReply.objects.filter(is_staff_reply=False, created_at__gt=seen_at)
            .exclude(author=user)
            .values_list("request_id", flat=True)
        )
        return len(new_requests | user_replies)

    admin_replies = set(
        SupportReply.objects.filter(request__user=user, is_staff_reply=True, created_at__gt=seen_at)
        .values_list("request_id", flat=True)
    )
    return len(admin_replies)


def support_unread_view(request):
    """GET: how many support items are new for the signed-in person."""
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Unauthorized"}, status=401)

    profile, _ = Profile.objects.get_or_create(user=request.user)

    # First time: start counting from now, so old replies do not show up as new
    if profile.support_seen_at is None:
        profile.support_seen_at = timezone.now()
        profile.save(update_fields=["support_seen_at"])
        return JsonResponse({"count": 0})

    return JsonResponse({"count": count_unread(request.user, profile.support_seen_at)})


@csrf_exempt
def support_seen_view(request):
    """POST: the person opened the Support page, so everything is now seen."""
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Unauthorized"}, status=401)
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    profile, _ = Profile.objects.get_or_create(user=request.user)
    profile.support_seen_at = timezone.now()
    profile.save(update_fields=["support_seen_at"])
    return JsonResponse({"count": 0})