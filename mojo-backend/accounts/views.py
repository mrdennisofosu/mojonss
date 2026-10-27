from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Profile
import json
from django.utils import timezone
from datetime import timedelta

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
                login(request, user)
                profile = getattr(user, 'profile', None)
                role = profile.role if profile else 'user'
                if user.is_superuser or user.is_staff: role = 'admin'
                status = profile.status if profile else 'active'
                return JsonResponse({
                    "status": "success",
                    "username": user.username,
                    "fullName": f"{user.first_name} {user.last_name}".strip() or user.username,
                    "email": user.email,
                    "role": role,
                    "status": status,
                    "emailVerified": profile.email_verified if profile else False,
                    "lastLogin": str(user.last_login),
                    "createdAt": str(user.date_joined),
                }, status=200)
            return JsonResponse({"status": "error", "error": "Invalid credentials"}, status=401)
        except Exception as e:
            return JsonResponse({"status": "error", "error": str(e)}, status=500)

def logout_view(request):
    logout(request)
    return JsonResponse({"status": "success"}, status=200)

def user_status(request):
    if request.user.is_authenticated:
        user = request.user
        profile = getattr(user, 'profile', None)
        return JsonResponse({
            "is_authenticated": True,
            "username": user.username,
            "role": profile.role if profile else 'user',
            "status": profile.status if profile else 'active',
        })
    return JsonResponse({"is_authenticated": False}, status=200)

def is_admin(user):
    if not user or not user.is_authenticated: return False
    return user.is_superuser or user.is_staff or getattr(user.profile, 'role', 'user') == 'admin'

def list_users_view(request):
    if not is_admin(request.user):
        return JsonResponse({"error": "Forbidden"}, status=403)
    users = User.objects.all()
    user_list = []
    for u in users:
        profile = getattr(u, 'profile', None)
        user_list.append({
            "id": u.id,
            "fullName": f"{u.first_name} {u.last_name}".strip() or u.username,
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
            user = User.objects.get(id=user_id)
            profile, _ = Profile.objects.get_or_create(user=user)
            profile.status = data.get('status')
            profile.save()
            return JsonResponse({"status": "success"})
        except Exception as e: return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def update_user_role_view(request, user_id):
    if not is_admin(request.user): return JsonResponse({"error": "Forbidden"}, status=403)
    if request.method == 'PATCH':
        try:
            data = json.loads(request.body)
            user = User.objects.get(id=user_id)
            profile, _ = Profile.objects.get_or_create(user=user)
            profile.role = data.get('role')
            profile.save()
            return JsonResponse({"status": "success"})
        except Exception as e: return JsonResponse({"error": str(e)}, status=500)

def list_overview_view(request):
    if not is_admin(request.user): return JsonResponse({"error": "Forbidden"}, status=403)
    total = User.objects.count()
    return JsonResponse({
        "totals": {"total": total, "active": 0, "inactive": 0, "newThisMonth": 0},
        "registrationsByMonth": [], "recentUsers": [], "recentActivity": []
    })

@csrf_exempt
def register_view(request):
    return JsonResponse({"status": "success"}, status=201)