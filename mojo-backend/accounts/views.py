from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.sessions.models import Session
from django.db.models import Q
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import (
    Profile, ActivityLog, UserSession, SystemSetting,
    SupportRequest, SupportReply, Announcement,
)
import json
from django.utils import timezone

def log_activity(user, action, description, request=None):
    """Helper to record user activity"""
    ActivityLog.objects.create(
        user=user,
        action=action,
        description=description,
        ip_address=request.META.get('REMOTE_ADDR') if request else None
    )


def full_name(user):
    """Full name if the user has one, otherwise the username."""
    return f"{user.first_name} {user.last_name}".strip() or user.username


def read_json(request):
    """Parse the request body as JSON, returning {} if it is empty or invalid."""
    try:
        return json.loads(request.body or '{}')
    except json.JSONDecodeError:
        return {}


def parse_device(user_agent):
    """Turn a User-Agent string into something readable, e.g. 'Chrome on Windows'."""
    ua = user_agent or ''

    # Order matters: iPhone/iPad UAs contain "Mac OS X", Android UAs contain "Linux"
    if 'iPhone' in ua:
        os_name = 'iPhone'
    elif 'iPad' in ua:
        os_name = 'iPad'
    elif 'Android' in ua:
        os_name = 'Android'
    elif 'Windows' in ua:
        os_name = 'Windows'
    elif 'Macintosh' in ua or 'Mac OS X' in ua:
        os_name = 'macOS'
    elif 'Linux' in ua:
        os_name = 'Linux'
    else:
        os_name = 'Unknown OS'

    # Order matters: Edge and Opera UAs also contain "Chrome"
    if 'Edg/' in ua:
        browser = 'Edge'
    elif 'OPR/' in ua or 'Opera' in ua:
        browser = 'Opera'
    elif 'Firefox/' in ua:
        browser = 'Firefox'
    elif 'Chrome/' in ua or 'CriOS/' in ua:
        browser = 'Chrome'
    elif 'Safari/' in ua:
        browser = 'Safari'
    else:
        browser = 'Unknown browser'

    return f"{browser} on {os_name}"


@csrf_exempt
def register_view(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username') or data.get('email', '').strip()
            email = data.get('email', '').strip()
            password = data.get('password', '').strip()
            first_name = data.get('firstName', '')
            last_name = data.get('lastName', '')
            role = data.get('role', 'user')

            if not username or not password:
                return JsonResponse({"status": "error", "error": "Username and password are required"}, status=400)

            if User.objects.filter(username=username).exists():
                return JsonResponse({"status": "error", "error": "Username already taken"}, status=400)

            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name
            )

            profile, created = Profile.objects.get_or_create(user=user)
            profile.role = role
            profile.save()

            log_activity(user, 'user_create', f"Account created with role {role}", request)

            return JsonResponse({
                "status": "success",
                "message": "User created successfully",
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "fullName": full_name(user),
                    "role": profile.role
                }
            }, status=201)
        except Exception as e:
            return JsonResponse({"status": "error", "error": str(e)}, status=500)

@csrf_exempt
def login_view(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            identifier = data.get('username', '').strip()
            password = data.get('password', '').strip()
            username_to_use = identifier
            if "@" in identifier:
                try:
                    user_obj = User.objects.get(email=identifier)
                    username_to_use = user_obj.username
                except User.DoesNotExist: pass
            user = authenticate(request, username=username_to_use, password=password)
            if user is not None:
                # Decide trust BEFORE logging this login, so we compare with earlier logins only
                ip = request.META.get('REMOTE_ADDR')
                has_history = ActivityLog.objects.filter(user=user, action='login').exists()
                known_ip = ActivityLog.objects.filter(user=user, action='login', ip_address=ip).exists()
                is_trusted = (not has_history) or known_ip

                login(request, user)
                profile = getattr(user, 'profile', None)
                role = 'user'
                if user.is_superuser or user.is_staff or (profile and profile.role == 'admin'):
                    role = 'admin'
                elif profile:
                    role = profile.role
                status = profile.status if profile else 'active'

                # Make sure the session has a key (cycle_key() returns None, so don't use its result)
                if not request.session.session_key:
                    request.session.save()
                session_key = request.session.session_key

                UserSession.objects.update_or_create(
                    session_key=session_key,
                    defaults={
                        'user': user,
                        'device': parse_device(request.META.get('HTTP_USER_AGENT')),
                        'ip_address': ip,
                        'location': 'Unknown',
                        'is_trusted': is_trusted,
                    },
                )

                log_activity(user, 'login', "User logged in", request)

                return JsonResponse({
                    "status": "success",
                    "id": user.id,
                    "username": user.username,
                    "fullName": full_name(user),
                    "email": user.email,
                    "role": role,
                    "status": status,
                    "emailVerified": profile.email_verified if profile else False,
                    "lastLogin": str(user.last_login),
                    "createdAt": str(user.date_joined),
                }, status=200)

            # Failed login: record it against the account if the account exists
            failed_user = User.objects.filter(username=username_to_use).first()
            if failed_user:
                log_activity(failed_user, 'login_failed', "Failed sign-in attempt (wrong password)", request)
            return JsonResponse({"status": "error", "error": "Invalid credentials"}, status=401)
        except Exception as e:
            return JsonResponse({"status": "error", "error": str(e)}, status=500)

@csrf_exempt
def logout_view(request):
    if request.user.is_authenticated:
        session_key = request.session.session_key
        if session_key:
            UserSession.objects.filter(session_key=session_key).delete()
        log_activity(request.user, 'logout', "User logged out", request)
        logout(request)

    response = JsonResponse({"status": "success"}, status=200)
    response.delete_cookie('sessionid')
    return response

def user_status(request):
    if request.user.is_authenticated:
        user = request.user
        profile = getattr(user, 'profile', None)
        role = 'user'
        if user.is_superuser or user.is_staff or (profile and profile.role == 'admin'):
            role = 'admin'
        elif profile:
            role = profile.role
        return JsonResponse({
            "is_authenticated": True,
            "id": user.id,
            "username": user.username,
            "fullName": full_name(user),
            "email": user.email,
            "role": role,
            "status": profile.status if profile else 'active',
            "emailVerified": profile.email_verified if profile else False,
            "lastLogin": str(user.last_login),
            "createdAt": str(user.date_joined),
        })
    return JsonResponse({"is_authenticated": False}, status=200)

def is_admin(user):
    if not user or not user.is_authenticated: return False
    profile = getattr(user, 'profile', None)
    return user.is_superuser or user.is_staff or getattr(profile, 'role', 'user') == 'admin'

def list_users_view(request):
    if not is_admin(request.user):
        return JsonResponse({"error": "Forbidden"}, status=403)

    search = request.GET.get('search', '').strip()
    role = request.GET.get('role', '').strip()
    status = request.GET.get('status', '').strip()

    users = User.objects.all()
    if search:
        users = users.filter(email__icontains=search)

    user_list = []
    for u in users:
        profile = getattr(u, 'profile', None)
        if role and profile and profile.role != role: continue
        if status and profile and profile.status != status: continue

        user_list.append({
            "id": u.id,
            "fullName": full_name(u),
            "email": u.email,
            "role": profile.role if profile else 'user',
            "status": profile.status if profile else 'active',
            "createdAt": str(u.date_joined),
        })
    return JsonResponse({"items": user_list, "total": len(user_list), "page": 1, "totalPages": 1, "pageSize": 10})

@csrf_exempt
def update_user_status_view(request, user_id):
    if not is_admin(request.user): return JsonResponse({"error": "Forbidden"}, status=403)
    if request.method == 'PATCH':
        try:
            data = json.loads(request.body)
            status = data.get('status')
            user = User.objects.get(id=user_id)
            profile, _ = Profile.objects.get_or_create(user=user)
            profile.status = status
            profile.save()
            log_activity(request.user, 'status_change', f"Changed user {user.username} status to {status}", request)
            return JsonResponse({"status": "success"})
        except Exception as e: return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def update_user_role_view(request, user_id):
    if not is_admin(request.user): return JsonResponse({"error": "Forbidden"}, status=403)
    if request.method == 'PATCH':
        try:
            data = json.loads(request.body)
            role = data.get('role')
            user = User.objects.get(id=user_id)
            profile, _ = Profile.objects.get_or_create(user=user)
            profile.role = role
            profile.save()
            log_activity(request.user, 'role_change', f"Changed user {user.username} role to {role}", request)
            return JsonResponse({"status": "success"})
        except Exception as e: return JsonResponse({"error": str(e)}, status=500)

def list_overview_view(request):
    if not is_admin(request.user): return JsonResponse({"error": "Forbidden"}, status=403)

    now = timezone.now()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    total = User.objects.count()
    inactive = Profile.objects.filter(status='inactive').count()
    pending = Profile.objects.filter(status='pending').count()
    # Users with no profile count as active, the same rule list_users_view uses
    active = total - inactive - pending
    new_this_month = User.objects.filter(date_joined__gte=month_start).count()

    # New registrations for each of the last 6 months, oldest first
    registrations_by_month = []
    for months_back in range(5, -1, -1):
        year = month_start.year
        month = month_start.month - months_back
        while month <= 0:
            month += 12
            year -= 1
        start = month_start.replace(year=year, month=month)
        if month == 12:
            end = month_start.replace(year=year + 1, month=1)
        else:
            end = month_start.replace(year=year, month=month + 1)
        registrations_by_month.append({
            "month": start.strftime("%b"),
            "count": User.objects.filter(date_joined__gte=start, date_joined__lt=end).count(),
        })

    recent_users = []
    for u in User.objects.select_related('profile').order_by('-date_joined')[:5]:
        profile = getattr(u, 'profile', None)
        recent_users.append({
            "id": u.id,
            "fullName": full_name(u),
            "email": u.email,
            "role": profile.role if profile else 'user',
            "status": profile.status if profile else 'active',
            "createdAt": str(u.date_joined),
        })

    recent_activity = []
    for a in ActivityLog.objects.select_related('user').order_by('-created_at')[:5]:
        recent_activity.append({
            "id": a.id,
            "actorName": full_name(a.user),
            "description": a.description,
            "type": a.action,
            "createdAt": str(a.created_at),
        })

    return JsonResponse({
        "totals": {
            "total": total,
            "active": active,
            "inactive": inactive,
            "newThisMonth": new_this_month,
        },
        "registrationsByMonth": registrations_by_month,
        "recentUsers": recent_users,
        "recentActivity": recent_activity,
    })

@csrf_exempt
def change_password_view(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Unauthorized"}, status=401)
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            current_password = data.get('currentPassword')
            new_password = data.get('newPassword')
            user = request.user
            if not user.check_password(current_password):
                return JsonResponse({"error": "Current password incorrect"}, status=400)
            user.set_password(new_password)
            user.save()
            log_activity(user, 'password_change', "User changed their own password", request)
            return JsonResponse({"status": "success", "message": "Password updated successfully"})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

# --- Activity Log API ---

def list_all_activities_view(request):
    if not is_admin(request.user):
        return JsonResponse({"error": "Forbidden"}, status=403)
    search = request.GET.get('search', '').strip()
    group = request.GET.get('group', '').strip()

    activities = ActivityLog.objects.select_related('user').all()
    if search:
        activities = activities.filter(
            Q(description__icontains=search)
            | Q(user__username__icontains=search)
            | Q(user__email__icontains=search)
            | Q(user__first_name__icontains=search)
            | Q(user__last_name__icontains=search)
        )
    if group:
        activities = activities.filter(action=group)

    activity_list = []
    for a in activities:
        activity_list.append({
            "id": a.id,
            "user": a.user.username,
            "actorName": full_name(a.user),
            "actorEmail": a.user.email,
            "description": a.description,
            "type": a.action,
            "createdAt": str(a.created_at),
        })
    return JsonResponse({"items": activity_list, "total": len(activity_list), "page": 1, "totalPages": 1, "pageSize": 10})

def list_failed_sign_ins_view(request, email):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Unauthorized"}, status=401)
    if request.user.email != email and not is_admin(request.user):
        return JsonResponse({"error": "Forbidden"}, status=403)

    activities = ActivityLog.objects.filter(user__email=email, action='login_failed')[:10]
    activity_list = []
    for a in activities:
        activity_list.append({
            "id": a.id,
            "description": a.description,
            "createdAt": str(a.created_at),
        })
    return JsonResponse({"items": activity_list, "total": len(activity_list)}, status=200)

def recent_activity_view(request, email):
    try:
        user = User.objects.get(email=email)
        activities = ActivityLog.objects.filter(user=user)[:10]
        activity_list = []
        for a in activities:
            activity_list.append({
                "id": a.id,
                "description": a.description,
                "type": a.action,
                "createdAt": str(a.created_at),
            })
        return JsonResponse({"items": activity_list, "total": len(activity_list)}, status=200)
    except User.DoesNotExist:
        return JsonResponse({"items": [], "total": 0}, status=200)

# --- Sessions API ---

def list_sessions_view(request, user_id=None):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Unauthorized"}, status=401)

    if user_id and str(user_id) != "undefined":
        try:
            target_user = User.objects.get(id=user_id)
            if not is_admin(request.user) and target_user != request.user:
                return JsonResponse({"error": "Forbidden"}, status=403)
            user = target_user
        except User.DoesNotExist:
            return JsonResponse({"items": [], "total": 0}, status=200)
    else:
        user = request.user

    current_key = request.session.session_key

    # Mark this device as active right now
    if current_key:
        UserSession.objects.filter(session_key=current_key).update(last_activity=timezone.now())

    sessions = list(UserSession.objects.filter(user=user).order_by('-created_at'))

    # Drop rows whose real Django session has expired or been deleted
    alive_keys = set(
        Session.objects.filter(
            session_key__in=[s.session_key for s in sessions],
            expire_date__gt=timezone.now(),
        ).values_list('session_key', flat=True)
    )
    stale_keys = [s.session_key for s in sessions if s.session_key not in alive_keys]
    if stale_keys:
        UserSession.objects.filter(session_key__in=stale_keys).delete()
    sessions = [s for s in sessions if s.session_key in alive_keys]

    session_list = []
    for s in sessions:
        session_list.append({
            "id": s.session_key,
            "device": s.device,
            "ip": s.ip_address,
            "location": s.location,
            "trusted": s.is_trusted,
            "startedAt": str(s.created_at),
            "lastActive": str(s.last_activity),
            "current": s.session_key == current_key
        })
    return JsonResponse({"items": session_list, "total": len(session_list)}, status=200)

@csrf_exempt
def revoke_session_view(request, session_id):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Unauthorized"}, status=401)
    if request.method != 'DELETE':
        return JsonResponse({"error": "Method not allowed"}, status=405)

    try:
        target = UserSession.objects.get(session_key=session_id)
    except UserSession.DoesNotExist:
        return JsonResponse({"error": "Session not found"}, status=404)

    if target.user != request.user and not is_admin(request.user):
        return JsonResponse({"error": "Forbidden"}, status=403)

    if target.session_key == request.session.session_key:
        return JsonResponse({"error": "You cannot sign out your current session here. Use Sign out instead."}, status=400)

    # Kill the real Django session so that device is actually logged out
    Session.objects.filter(session_key=target.session_key).delete()
    device = target.device
    target.delete()

    log_activity(request.user, 'logout', f"Signed out session: {device}", request)
    return JsonResponse({"status": "success"}, status=200)

@csrf_exempt
def revoke_other_sessions_view(request, user_id):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Unauthorized"}, status=401)
    if request.method != 'POST':
        return JsonResponse({"error": "Method not allowed"}, status=405)

    if request.user.id != int(user_id) and not is_admin(request.user):
        return JsonResponse({"error": "Forbidden"}, status=403)

    others = UserSession.objects.filter(user_id=user_id).exclude(session_key=request.session.session_key)
    keys = list(others.values_list('session_key', flat=True))

    Session.objects.filter(session_key__in=keys).delete()
    others.delete()

    log_activity(request.user, 'logout', f"Signed out {len(keys)} other session(s)", request)
    return JsonResponse({"status": "success", "revoked": len(keys)}, status=200)

# --- Support API ---

# def serialize_reply(reply):
#     return {
#         "id": reply.id,
#         "authorName": full_name(reply.author),
#         "isStaff": reply.is_staff_reply,
#         "message": reply.message,
#         "createdAt": str(reply.created_at),
#     }

# def serialize_support_request(r, include_replies=False):
#     data = {
#         "id": r.id,
#         "user": r.user.username,
#         "userName": full_name(r.user),
#         "userEmail": r.user.email,
#         "subject": r.subject,
#         "message": r.message,
#         "status": r.status,
#         "createdAt": str(r.created_at),
#         "resolvedAt": str(r.resolved_at) if r.resolved_at else None,
#         "replyCount": r.replies.count(),
#     }
#     if include_replies:
#         data["replies"] = [serialize_reply(rep) for rep in r.replies.select_related('author')]
#     return data

# @csrf_exempt
# def support_collection_view(request):
#     """GET = admin lists every request. POST = a signed-in user creates one."""
#     if not request.user.is_authenticated:
#         return JsonResponse({"error": "Unauthorized"}, status=401)

#     if request.method == 'POST':
#         data = read_json(request)
#         subject = (data.get('subject') or '').strip()
#         message = (data.get('message') or '').strip()
#         if not subject or not message:
#             return JsonResponse({"error": "Subject and message are required"}, status=400)

#         request_obj = SupportRequest.objects.create(
#             user=request.user,
#             subject=subject,
#             message=message,
#         )
#         log_activity(request.user, 'support_request', f"Created support request: {subject}", request)
#         return JsonResponse(serialize_support_request(request_obj), status=201)

#     if request.method == 'GET':
#         if not is_admin(request.user):
#             return JsonResponse({"error": "Forbidden"}, status=403)

#         search = request.GET.get('search', '').strip()
#         status = request.GET.get('status', '').strip()

#         requests = SupportRequest.objects.select_related('user')
#         if search:
#             requests = requests.filter(
#                 Q(subject__icontains=search)
#                 | Q(user__username__icontains=search)
#                 | Q(user__email__icontains=search)
#             )
#         if status:
#             requests = requests.filter(status=status)

#         request_list = [serialize_support_request(r) for r in requests]
#         return JsonResponse({"items": request_list, "total": len(request_list), "page": 1, "totalPages": 1, "pageSize": 8})

#     return JsonResponse({"error": "Method not allowed"}, status=405)

# def my_support_requests_view(request, email):
#     if not request.user.is_authenticated:
#         return JsonResponse({"error": "Unauthorized"}, status=401)
#     if request.user.email != email and not is_admin(request.user):
#         return JsonResponse({"error": "Forbidden"}, status=403)

#     try:
#         user = User.objects.get(email=email)
#     except User.DoesNotExist:
#         return JsonResponse({"items": [], "total": 0}, status=200)

#     requests = SupportRequest.objects.filter(user=user).select_related('user').order_by('-created_at')
#     request_list = [serialize_support_request(r) for r in requests]
#     return JsonResponse({"items": request_list, "total": len(request_list)}, status=200)

# def support_detail_view(request, request_id):
#     if not request.user.is_authenticated:
#         return JsonResponse({"error": "Unauthorized"}, status=401)
#     try:
#         support = SupportRequest.objects.select_related('user').get(id=request_id)
#     except SupportRequest.DoesNotExist:
#         return JsonResponse({"error": "Support request not found"}, status=404)

#     if support.user != request.user and not is_admin(request.user):
#         return JsonResponse({"error": "Forbidden"}, status=403)

#     return JsonResponse(serialize_support_request(support, include_replies=True), status=200)

# @csrf_exempt
# def support_reply_view(request, request_id):
#     """The owner or an admin adds a reply to a request."""
#     if not request.user.is_authenticated:
#         return JsonResponse({"error": "Unauthorized"}, status=401)
#     if request.method != 'POST':
#         return JsonResponse({"error": "Method not allowed"}, status=405)

#     try:
#         support = SupportRequest.objects.select_related('user').get(id=request_id)
#     except SupportRequest.DoesNotExist:
#         return JsonResponse({"error": "Support request not found"}, status=404)

#     staff = is_admin(request.user)
#     if support.user != request.user and not staff:
#         return JsonResponse({"error": "Forbidden"}, status=403)

#     message = (read_json(request).get('message') or '').strip()
#     if not message:
#         return JsonResponse({"error": "Message is required"}, status=400)

#     reply = SupportReply.objects.create(
#         request=support,
#         author=request.user,
#         message=message,
#         is_staff_reply=staff,
#     )

#     # Admin answers an open request -> waiting for the user.
#     # User writes back on a pending/resolved request -> back to open.
#     if staff and support.status == 'open':
#         support.status = 'pending'
#         support.save(update_fields=['status'])
#     elif not staff and support.status in ('pending', 'resolved'):
#         support.status = 'open'
#         support.resolved_at = None
#         support.save(update_fields=['status', 'resolved_at'])

#     log_activity(request.user, 'support_reply', f"Replied to support request: {support.subject}", request)
#     return JsonResponse(serialize_reply(reply), status=201)

# @csrf_exempt
# def support_status_view(request, request_id):
#     """Admin changes the status: open, pending or resolved."""
#     if not is_admin(request.user):
#         return JsonResponse({"error": "Forbidden"}, status=403)
#     if request.method != 'PATCH':
#         return JsonResponse({"error": "Method not allowed"}, status=405)

#     try:
#         support = SupportRequest.objects.get(id=request_id)
#     except SupportRequest.DoesNotExist:
#         return JsonResponse({"error": "Support request not found"}, status=404)

#     status = read_json(request).get('status')
#     if status not in ('open', 'pending', 'resolved'):
#         return JsonResponse({"error": "Status must be open, pending or resolved"}, status=400)

#     support.status = status
#     support.resolved_at = timezone.now() if status == 'resolved' else None
#     support.save(update_fields=['status', 'resolved_at'])

#     log_activity(request.user, 'support_reply', f"Set support request '{support.subject}' to {status}", request)
#     return JsonResponse({"status": "success"}, status=200)

# --- Announcements API ---

# def serialize_announcement(a):
#     return {
#         "id": a.id,
#         "title": a.title,
#         "body": a.body,
#         "status": a.status,
#         "author": full_name(a.created_by) if a.created_by else "Unknown",
#         "createdAt": str(a.created_at),
#         "publishedAt": str(a.published_at) if a.published_at else None,
#     }

# @csrf_exempt
# def announcements_collection_view(request):
#     """GET = admin lists all (drafts too). POST = admin creates one."""
#     if not is_admin(request.user):
#         return JsonResponse({"error": "Forbidden"}, status=403)

#     if request.method == 'POST':
#         data = read_json(request)
#         title = (data.get('title') or '').strip()
#         body = (data.get('body') or '').strip()
#         status = data.get('status', 'draft')
#         if not title or not body:
#             return JsonResponse({"error": "Title and body are required"}, status=400)
#         if status not in ('draft', 'published'):
#             return JsonResponse({"error": "Status must be draft or published"}, status=400)

#         announcement = Announcement.objects.create(
#             title=title,
#             body=body,
#             status=status,
#             created_by=request.user,
#             published_at=timezone.now() if status == 'published' else None,
#         )
#         log_activity(request.user, 'announcement', f"Created announcement: {title} ({status})", request)
#         return JsonResponse(serialize_announcement(announcement), status=201)

#     if request.method == 'GET':
#         announcements = Announcement.objects.select_related('created_by')
#         status = request.GET.get('status', '').strip()
#         if status:
#             announcements = announcements.filter(status=status)
#         items = [serialize_announcement(a) for a in announcements]
#         return JsonResponse({"items": items, "total": len(items)}, status=200)

#     return JsonResponse({"error": "Method not allowed"}, status=405)

# @csrf_exempt
# def announcement_detail_view(request, announcement_id):
#     """PATCH = admin edits. DELETE = admin deletes."""
#     if not is_admin(request.user):
#         return JsonResponse({"error": "Forbidden"}, status=403)

#     try:
#         announcement = Announcement.objects.get(id=announcement_id)
#     except Announcement.DoesNotExist:
#         return JsonResponse({"error": "Announcement not found"}, status=404)

#     if request.method == 'DELETE':
#         title = announcement.title
#         announcement.delete()
#         log_activity(request.user, 'announcement', f"Deleted announcement: {title}", request)
#         return JsonResponse({"status": "success"}, status=200)

#     if request.method == 'PATCH':
#         data = read_json(request)
#         if 'title' in data:
#             announcement.title = (data['title'] or '').strip() or announcement.title
#         if 'body' in data:
#             announcement.body = (data['body'] or '').strip() or announcement.body
#         if data.get('status') in ('draft', 'published'):
#             if data['status'] == 'published' and announcement.status != 'published':
#                 announcement.published_at = timezone.now()
#             announcement.status = data['status']
#         announcement.save()
#         log_activity(request.user, 'announcement', f"Updated announcement: {announcement.title}", request)
#         return JsonResponse(serialize_announcement(announcement), status=200)

#     return JsonResponse({"error": "Method not allowed"}, status=405)

# @csrf_exempt
# def announcement_publish_view(request, announcement_id):
#     """POST {"published": true} publishes. POST {"published": false} moves it back to draft."""
#     if not is_admin(request.user):
#         return JsonResponse({"error": "Forbidden"}, status=403)
#     if request.method != 'POST':
#         return JsonResponse({"error": "Method not allowed"}, status=405)

#     try:
#         announcement = Announcement.objects.get(id=announcement_id)
#     except Announcement.DoesNotExist:
#         return JsonResponse({"error": "Announcement not found"}, status=404)

#     publish = read_json(request).get('published', True)
#     if publish:
#         announcement.status = 'published'
#         announcement.published_at = timezone.now()
#     else:
#         announcement.status = 'draft'
#     announcement.save()

#     word = 'Published' if publish else 'Unpublished'
#     log_activity(request.user, 'announcement', f"{word} announcement: {announcement.title}", request)
#     return JsonResponse(serialize_announcement(announcement), status=200)

# def announcements_published_view(request):
#     announcements = Announcement.objects.filter(status='published').select_related('created_by').order_by('-published_at')
#     items = [serialize_announcement(a) for a in announcements]
#     return JsonResponse({"items": items, "total": len(items)}, status=200)

# def announcements_teasers_view(request):
#     announcements = Announcement.objects.filter(status='published').select_related('created_by').order_by('-published_at')[:3]
#     items = [serialize_announcement(a) for a in announcements]
#     return JsonResponse({"items": items, "total": len(items)}, status=200)

# --- System Settings API ---

@csrf_exempt
def update_settings_view(request):
    if not is_admin(request.user):
        return JsonResponse({"error": "Forbidden"}, status=403)
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            settings_map = {
                "appName": "general.appName",
                "supportEmail": "general.supportEmail",
                "publicRegistrationEnabled": "registration.publicRegistrationEnabled",
                "minPasswordLength": "security.minPasswordLength",
                "requireEmailVerification": "security.requireEmailVerification",
                "maxFailedAttempts": "security.maxFailedAttempts",
                "lockoutMinutes": "security.lockoutMinutes",
                "sessionTimeoutMinutes": "session.sessionTimeoutMinutes",
                "allowRememberMe": "session.allowRememberMe",
            }
            for key, path in settings_map.items():
                if key in data:
                    SystemSetting.objects.update_or_create(
                        key=key,
                        defaults={'value': str(data[key])}
                    )
            return JsonResponse({"status": "success"}, status=200)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

def public_settings_view(request):
    settings = {
        "general": {
            "appName": SystemSetting.objects.get_or_create(key="appName")[0].value or "Mojo App",
            "supportEmail": SystemSetting.objects.get_or_create(key="supportEmail")[0].value or "support@mojo.com",
        },
        "registration": {
            "publicRegistrationEnabled": SystemSetting.objects.get_or_create(key="publicRegistrationEnabled")[0].value == "True",
        },
        "security": {
            "minPasswordLength": int(SystemSetting.objects.get_or_create(key="minPasswordLength")[0].value or 8),
            "requireEmailVerification": SystemSetting.objects.get_or_create(key="requireEmailVerification")[0].value == "True",
            "maxFailedAttempts": int(SystemSetting.objects.get_or_create(key="maxFailedAttempts")[0].value or 5),
            "lockoutMinutes": int(SystemSetting.objects.get_or_create(key="lockoutMinutes")[0].value or 15),
        },
        "session": {
            "sessionTimeoutMinutes": int(SystemSetting.objects.get_or_create(key="sessionTimeoutMinutes")[0].value or 30),
            "allowRememberMe": SystemSetting.objects.get_or_create(key="allowRememberMe")[0].value == "True",
        }
    }
    return JsonResponse({"settings": settings}, status=200)

   