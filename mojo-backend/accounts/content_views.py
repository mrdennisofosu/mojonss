import json
import math

from django.contrib.auth.models import User
from django.db.models import Q
from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt

from .models import SupportRequest, SupportReply, Announcement
from .views import is_admin, log_activity

SUPPORT_STATUSES = ('pending', 'in_progress', 'resolved')


# ---------- Small helpers ----------

def display_name(user):
    return f"{user.first_name} {user.last_name}".strip() or user.username


def read_json(request):
    try:
        return json.loads(request.body or '{}')
    except json.JSONDecodeError:
        return {}


def paginate(request, queryset, serialize, default_size=8):
    """Slice a queryset using ?page= and ?pageSize= and build the response body."""
    try:
        page = max(int(request.GET.get('page', 1)), 1)
    except ValueError:
        page = 1
    try:
        size = min(max(int(request.GET.get('pageSize', default_size)), 1), 50)
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


def apply_limit(request, queryset, default=None):
    """Honour ?limit=N (used by the teaser and published lists)."""
    raw = request.GET.get('limit', '')
    try:
        limit = int(raw) if raw != '' else default
    except ValueError:
        limit = default
    return queryset[:limit] if limit and limit > 0 else queryset


# ---------- Announcements ----------

def serialize_announcement(a):
    return {
        "id": a.id,
        "title": a.title,
        "content": a.body,
        "excerpt": a.body[:140],
        "status": a.status,
        "author": display_name(a.created_by) if a.created_by else "Unknown",
        "createdAt": str(a.created_at),
        "publishedAt": str(a.published_at) if a.published_at else None,
    }


def validate_announcement(title, content):
    if not title:
        return "Enter a title."
    if len(title) > 120:
        return "Keep the title under 120 characters."
    if not content:
        return "Write the announcement."
    if len(content) > 2000:
        return "Keep the announcement under 2000 characters."
    return ""


@csrf_exempt
def announcements_collection_view(request):
    """Admin only. GET = list (drafts too). POST = create."""
    if not is_admin(request.user):
        return JsonResponse({"error": "Forbidden"}, status=403)

    if request.method == 'POST':
        data = read_json(request)
        title = (data.get('title') or '').strip()
        content = (data.get('content') or data.get('body') or '').strip()
        publish = bool(data.get('publish', False))

        error = validate_announcement(title, content)
        if error:
            return JsonResponse({"error": error}, status=400)

        announcement = Announcement.objects.create(
            title=title,
            body=content,
            status='published' if publish else 'draft',
            created_by=request.user,
            published_at=timezone.now() if publish else None,
        )
        word = 'published' if publish else 'draft'
        log_activity(request.user, 'announcement', f"Created announcement: {title} ({word})", request)
        return JsonResponse(serialize_announcement(announcement), status=201)

    if request.method == 'GET':
        announcements = Announcement.objects.select_related('created_by')
        search = request.GET.get('search', '').strip()
        status = request.GET.get('status', '').strip()
        if search:
            announcements = announcements.filter(Q(title__icontains=search) | Q(body__icontains=search))
        if status in ('draft', 'published'):
            announcements = announcements.filter(status=status)
        return JsonResponse(paginate(request, announcements, serialize_announcement))

    return JsonResponse({"error": "Method not allowed"}, status=405)


@csrf_exempt
def announcement_detail_view(request, announcement_id):
    """Admin only. PATCH = edit title/content. DELETE = delete."""
    if not is_admin(request.user):
        return JsonResponse({"error": "Forbidden"}, status=403)

    try:
        announcement = Announcement.objects.select_related('created_by').get(id=announcement_id)
    except Announcement.DoesNotExist:
        return JsonResponse({"error": "Announcement not found"}, status=404)

    if request.method == 'DELETE':
        title = announcement.title
        announcement.delete()
        log_activity(request.user, 'announcement', f"Deleted announcement: {title}", request)
        return JsonResponse({"status": "success"})

    if request.method == 'PATCH':
        data = read_json(request)
        title = (data.get('title', announcement.title) or '').strip()
        content = (data.get('content', data.get('body', announcement.body)) or '').strip()

        error = validate_announcement(title, content)
        if error:
            return JsonResponse({"error": error}, status=400)

        announcement.title = title
        announcement.body = content
        announcement.save()
        log_activity(request.user, 'announcement', f"Updated announcement: {title}", request)
        return JsonResponse(serialize_announcement(announcement))

    return JsonResponse({"error": "Method not allowed"}, status=405)


@csrf_exempt
def announcement_publish_view(request, announcement_id):
    """Admin only. PATCH {"published": true|false}."""
    if not is_admin(request.user):
        return JsonResponse({"error": "Forbidden"}, status=403)
    if request.method not in ('PATCH', 'POST'):
        return JsonResponse({"error": "Method not allowed"}, status=405)

    try:
        announcement = Announcement.objects.select_related('created_by').get(id=announcement_id)
    except Announcement.DoesNotExist:
        return JsonResponse({"error": "Announcement not found"}, status=404)

    publish = bool(read_json(request).get('published', True))
    if publish:
        announcement.status = 'published'
        announcement.published_at = timezone.now()
    else:
        announcement.status = 'draft'
    announcement.save()

    word = 'Published' if publish else 'Unpublished'
    log_activity(request.user, 'announcement', f"{word} announcement: {announcement.title}", request)
    return JsonResponse(serialize_announcement(announcement))


def published_queryset():
    return Announcement.objects.filter(status='published').select_related('created_by').order_by('-published_at')


def announcements_published_view(request):
    """Public: anyone, signed in or not."""
    items = apply_limit(request, published_queryset())
    data = [serialize_announcement(a) for a in items]
    return JsonResponse({"items": data, "total": len(data)})


def announcements_teasers_view(request):
    """Public: the latest few, 3 by default."""
    items = apply_limit(request, published_queryset(), default=3)
    data = [serialize_announcement(a) for a in items]
    return JsonResponse({"items": data, "total": len(data)})


def published_announcement_view(request, announcement_id):
    """Public: one published announcement."""
    try:
        announcement = published_queryset().get(id=announcement_id)
    except Announcement.DoesNotExist:
        return JsonResponse({"error": "Announcement not found"}, status=404)
    return JsonResponse(serialize_announcement(announcement))


# ---------- Support ----------

def serialize_reply(reply):
    return {
        "id": reply.id,
        "authorName": display_name(reply.author),
        "authorRole": 'admin' if reply.is_staff_reply else 'user',
        "message": reply.message,
        "createdAt": str(reply.created_at),
    }


def serialize_support_request(s):
    return {
        "id": s.id,
        "userId": s.user_id,
        "userName": display_name(s.user),
        "userEmail": s.user.email,
        "subject": s.subject,
        "message": s.message,
        "status": s.status,
        "createdAt": str(s.created_at),
        "updatedAt": str(s.updated_at),
        "resolvedAt": str(s.resolved_at) if s.resolved_at else None,
        "replies": [serialize_reply(r) for r in s.replies.all()],
    }


def support_queryset():
    return SupportRequest.objects.select_related('user').prefetch_related('replies__author')


def load_support_request(request_id):
    return support_queryset().filter(id=request_id).first()


@csrf_exempt
def support_collection_view(request):
    """GET = admin lists every request. POST = a signed-in user creates one."""
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Unauthorized"}, status=401)

    if request.method == 'POST':
        data = read_json(request)
        subject = (data.get('subject') or '').strip()
        message = (data.get('message') or '').strip()
        if not subject or not message:
            return JsonResponse({"error": "Subject and message are required"}, status=400)
        if len(subject) > 255:
            return JsonResponse({"error": "Keep the subject under 255 characters"}, status=400)
        if len(message) > 2000:
            return JsonResponse({"error": "Keep the message under 2000 characters"}, status=400)

        created = SupportRequest.objects.create(user=request.user, subject=subject, message=message)
        log_activity(request.user, 'support_request', f"Created support request: {subject}", request)
        return JsonResponse(serialize_support_request(load_support_request(created.id)), status=201)

    if request.method == 'GET':
        if not is_admin(request.user):
            return JsonResponse({"error": "Forbidden"}, status=403)

        requests = support_queryset().order_by('-updated_at')
        search = request.GET.get('search', '').strip()
        status = request.GET.get('status', '').strip()
        if search:
            requests = requests.filter(
                Q(subject__icontains=search)
                | Q(user__username__icontains=search)
                | Q(user__email__icontains=search)
                | Q(user__first_name__icontains=search)
                | Q(user__last_name__icontains=search)
            )
        if status in SUPPORT_STATUSES:
            requests = requests.filter(status=status)
        return JsonResponse(paginate(request, requests, serialize_support_request))

    return JsonResponse({"error": "Method not allowed"}, status=405)


def my_support_requests_view(request, who):
    """The signed-in user's own requests. `who` can be an email or a user id."""
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Unauthorized"}, status=401)

    if '@' in who:
        target = User.objects.filter(email=who).first()
    elif who.isdigit():
        target = User.objects.filter(id=int(who)).first()
    else:
        target = None

    if target is None:
        return JsonResponse({"items": [], "total": 0})
    if target != request.user and not is_admin(request.user):
        return JsonResponse({"error": "Forbidden"}, status=403)

    requests = support_queryset().filter(user=target).order_by('-updated_at')
    items = [serialize_support_request(s) for s in requests]
    return JsonResponse({"items": items, "total": len(items)})


def support_detail_view(request, request_id):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Unauthorized"}, status=401)

    support = load_support_request(request_id)
    if support is None:
        return JsonResponse({"error": "Support request not found"}, status=404)
    if support.user != request.user and not is_admin(request.user):
        return JsonResponse({"error": "Forbidden"}, status=403)

    return JsonResponse(serialize_support_request(support))


@csrf_exempt
def support_reply_view(request, request_id):
    """The owner or an admin adds a reply. Returns the whole updated request."""
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Unauthorized"}, status=401)
    if request.method != 'POST':
        return JsonResponse({"error": "Method not allowed"}, status=405)

    support = load_support_request(request_id)
    if support is None:
        return JsonResponse({"error": "Support request not found"}, status=404)

    staff = is_admin(request.user)
    if support.user != request.user and not staff:
        return JsonResponse({"error": "Forbidden"}, status=403)

    message = (read_json(request).get('message') or '').strip()
    if not message:
        return JsonResponse({"error": "Write a reply first."}, status=400)
    if len(message) > 2000:
        return JsonResponse({"error": "Keep the reply under 2000 characters."}, status=400)

    SupportReply.objects.create(
        request=support,
        author=request.user,
        message=message,
        is_staff_reply=staff,
    )

    # Admin answers a new request -> in progress.
    # The user writes back on a resolved request -> it goes back to pending.
    if staff and support.status == 'pending':
        support.status = 'in_progress'
    elif not staff and support.status == 'resolved':
        support.status = 'pending'
        support.resolved_at = None
    support.save()  # also refreshes updated_at

    log_activity(request.user, 'support_reply', f"Replied to support request: {support.subject}", request)
    return JsonResponse(serialize_support_request(load_support_request(request_id)), status=201)


@csrf_exempt
def support_status_view(request, request_id):
    """Admin only. PATCH {"status": "pending" | "in_progress" | "resolved"}."""
    if not is_admin(request.user):
        return JsonResponse({"error": "Forbidden"}, status=403)
    if request.method != 'PATCH':
        return JsonResponse({"error": "Method not allowed"}, status=405)

    support = load_support_request(request_id)
    if support is None:
        return JsonResponse({"error": "Support request not found"}, status=404)

    status = read_json(request).get('status')
    if status not in SUPPORT_STATUSES:
        return JsonResponse({"error": "Status must be pending, in_progress or resolved"}, status=400)

    support.status = status
    support.resolved_at = timezone.now() if status == 'resolved' else None
    support.save()

    log_activity(request.user, 'support_reply', f"Set support request '{support.subject}' to {status}", request)
    return JsonResponse(serialize_support_request(load_support_request(request_id)))

def my_support_requests_self_view(request):
     if not request.user.is_authenticated:
         return JsonResponse({"detail": "Not signed in"}, status=401)
     who = request.user.email or str(request.user.id)
     return my_support_requests_view(request, who)