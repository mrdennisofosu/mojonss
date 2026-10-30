from django.urls import path
from . import views, auth_views, admin_views, verification_views, settings_views, notification_views
from . import content_views as cv

urlpatterns = [
    # Sign in, sign out, register
    path('login/', auth_views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('status/', auth_views.user_status, name='status'),
    path('register/', verification_views.register_with_verification, name='register'),

    # Email verification
    path('verify-email/', verification_views.verify_email_view, name='verify_email'),
    path('resend-verification/', verification_views.resend_verification_view, name='resend_verification'),
    path('send-verification/', verification_views.send_my_verification_view, name='send_verification'),

    # Password Management
    path('change-password/', views.change_password_view, name='change_password'),

    # User Management (the more specific routes go first)
    path('users/', admin_views.list_users_view, name='list_users'),
    path('users/create/', admin_views.create_user_view, name='create_user'),
    path('users/<int:user_id>/status/', admin_views.set_status_view, name='update_user_status'),
    path('users/<int:user_id>/role/', admin_views.set_role_view, name='update_user_role'),
    path('users/<int:user_id>/', admin_views.update_user_view, name='user_detail'),

    # Admin Overview
    path('admin/overview/', views.list_overview_view, name='admin_overview'),

    # Activity Logs
    path('activity-logs/', views.list_all_activities_view, name='all_activities'),
    path('activity/recent/<str:email>/', views.recent_activity_view, name='recent_activity'),
    path('activity/failed/<str:email>/', views.list_failed_sign_ins_view, name='failed_sign_ins'),

    # Sessions (the more specific routes go first)
    path('sessions/revoke/<str:session_id>/', views.revoke_session_view, name='revoke_session'),
    path('sessions/<int:user_id>/revoke-others/', views.revoke_other_sessions_view, name='revoke_other_sessions'),
    path('sessions/', views.list_sessions_view, name='list_sessions'),
    path('sessions/<str:user_id>/', views.list_sessions_view, name='list_sessions_by_user'),

    # Announcements
    path('announcements/', cv.announcements_collection_view),
    path('announcements/published/', cv.announcements_published_view),
    path('announcements/teasers/', cv.announcements_teasers_view),
    path('announcements/published/<int:announcement_id>/', cv.published_announcement_view),
    path('announcements/<int:announcement_id>/', cv.announcement_detail_view),
    path('announcements/<int:announcement_id>/publish/', cv.announcement_publish_view),

    # Support
    path('support/unread/', notification_views.support_unread_view, name='support_unread'),
    path('support/seen/', notification_views.support_seen_view, name='support_seen'),
    path('support/', cv.support_collection_view),
    path('support/my/', cv.my_support_requests_self_view),
    path('support/user/<str:who>/', cv.my_support_requests_view),
    path('support/<int:request_id>/', cv.support_detail_view),
    path('support/<int:request_id>/reply/', cv.support_reply_view),
    path('support/<int:request_id>/status/', cv.support_status_view),

    # System settings: anyone reads, only the super admin saves
    path('settings/public/', settings_views.public_settings_view, name='public_settings'),
    path('settings/', admin_views.settings_gate_view, name='settings'),
]