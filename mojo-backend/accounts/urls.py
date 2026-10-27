from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('status/', views.user_status, name='status'),
    path('register/', views.register_view, name='register'),

    # User Management
    path('users/', views.list_users_view, name='list_users'),
    path('users/<int:user_id>/status/', views.update_user_status_view, name='update_user_status'),
    path('users/<int:user_id>/role/', views.update_user_role_view, name='update_user_role'),

    # Admin Overview
    path('admin/overview/', views.list_overview_view, name='admin_overview'),
]