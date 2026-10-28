from django.urls import path
from . import views, content_views
from . import content_views as cv 

urlpatterns = [
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('status/', views.user_status, name='status'),
    path('register/', views.register_view, name='register'),

    # Password Management
    path('change-password/', views.change_password_view, name='change_password'),

    # User Management
    path('users/', views.list_users_view, name='list_users'),
    path('users/<int:user_id>/status/', views.update_user_status_view, name='update_user_status'),
    path('users/<int:user_id>/role/', views.update_user_role_view, name='update_user_role'),

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

    # Announcements (the more specific routes go first)
    # path('announcements/published/<int:announcement_id>/', content_views.published_announcement_view, name='announcement_published_detail'),
    # path('announcements/published/', content_views.announcements_published_view, name='announcements_published'),
    # path('announcements/teasers/', content_views.announcements_teasers_view, name='announcements_teasers'),
    # path('announcements/<int:announcement_id>/publish/', content_views.announcement_publish_view, name='announcement_publish'),
    # path('announcements/<int:announcement_id>/', content_views.announcement_detail_view, name='announcement_detail'),
    # path('announcements/', content_views.announcements_collection_view, name='announcements'),

    # announcements
    path('announcements/', cv.announcements_collection_view),
    path('announcements/published/', cv.announcements_published_view),
    path('announcements/teasers/', cv.announcements_teasers_view),
    path('announcements/published/<int:announcement_id>/', cv.published_announcement_view),
    path('announcements/<int:announcement_id>/', cv.announcement_detail_view),
    path('announcements/<int:announcement_id>/publish/', cv.announcement_publish_view),

    # # Support (the more specific routes go first)
    # path('support/my/<str:who>/', content_views.my_support_requests_view, name='my_support_requests'),
    # path('support/<int:request_id>/reply/', content_views.support_reply_view, name='support_reply'),
    # path('support/<int:request_id>/status/', content_views.support_status_view, name='support_status'),
    # path('support/<int:request_id>/', content_views.support_detail_view, name='support_detail'),
    # path('support/', content_views.support_collection_view, name='support'),

    # support
    path('support/', cv.support_collection_view),
    path('support/my/', cv.my_support_requests_self_view),
    path('support/user/<str:who>/', cv.my_support_requests_view),
    path('support/<int:request_id>/', cv.support_detail_view),
    path('support/<int:request_id>/reply/', cv.support_reply_view),
    path('support/<int:request_id>/status/', cv.support_status_view),

    # Settings
    path('settings/', views.public_settings_view, name='settings'),
    path('settings/public/', views.public_settings_view, name='public_settings'),
]