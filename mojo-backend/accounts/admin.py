from django.contrib import admin, messages
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from django.contrib.sessions.models import Session
from django.utils import timezone

from .models import (
    Profile, ActivityLog, UserSession, SystemSetting,
    SupportRequest, SupportReply, Announcement,
)

# Titles shown at the top of the admin site
admin.site.site_header = "Mojo Administration"
admin.site.site_title = "Mojo Admin"
admin.site.index_title = "Manage users, sessions and activity"


# ---------- Users and profiles ----------

class ProfileInline(admin.StackedInline):
    model = Profile
    can_delete = False
    verbose_name_plural = 'Profile'


class CustomUserAdmin(UserAdmin):
    inlines = (ProfileInline,)
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'is_active', 'date_joined')
    list_filter = ('is_staff', 'is_superuser', 'is_active')
    search_fields = ('username', 'email', 'first_name', 'last_name')


class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'status', 'email_verified', 'created_at')
    list_filter = ('role', 'status', 'email_verified')
    search_fields = ('user__username', 'user__email')
    list_select_related = ('user',)


# ---------- Activity logs (read-only) ----------

class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ('created_at', 'user', 'action', 'description', 'ip_address')
    list_filter = ('action',)
    search_fields = ('user__username', 'user__email', 'description', 'ip_address')
    date_hierarchy = 'created_at'
    list_select_related = ('user',)

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False


# ---------- Sessions ----------

class UserSessionAdmin(admin.ModelAdmin):
    list_display = ('user', 'device', 'ip_address', 'location', 'is_trusted', 'created_at', 'last_activity')
    list_filter = ('is_trusted',)
    search_fields = ('user__username', 'user__email', 'device', 'ip_address')
    list_select_related = ('user',)
    actions = ['sign_out_sessions']

    def has_add_permission(self, request):
        return False

    @admin.action(description="Sign out selected sessions (ends the real login)")
    def sign_out_sessions(self, request, queryset):
        count = queryset.count()
        Session.objects.filter(session_key__in=list(queryset.values_list('session_key', flat=True))).delete()
        queryset.delete()
        self.message_user(request, f"Signed out {count} session(s).", messages.SUCCESS)

    def delete_model(self, request, obj):
        Session.objects.filter(session_key=obj.session_key).delete()
        super().delete_model(request, obj)

    def delete_queryset(self, request, queryset):
        Session.objects.filter(session_key__in=list(queryset.values_list('session_key', flat=True))).delete()
        super().delete_queryset(request, queryset)


# ---------- Support requests and replies ----------

class SupportReplyInline(admin.StackedInline):
    model = SupportReply
    extra = 1
    fields = ('author', 'is_staff_reply', 'message', 'created_at')
    readonly_fields = ('author', 'is_staff_reply', 'created_at')


class SupportRequestAdmin(admin.ModelAdmin):
    list_display = ('updated_at', 'user', 'subject', 'status', 'resolved_at')
    list_filter = ('status',)
    search_fields = ('user__username', 'user__email', 'subject', 'message')
    date_hierarchy = 'created_at'
    list_select_related = ('user',)
    inlines = [SupportReplyInline]
    actions = ['mark_in_progress', 'mark_resolved']

    def save_model(self, request, obj, form, change):
        if obj.status == 'resolved' and obj.resolved_at is None:
            obj.resolved_at = timezone.now()
        elif obj.status != 'resolved':
            obj.resolved_at = None
        super().save_model(request, obj, form, change)

    @admin.action(description="Mark selected requests as in progress")
    def mark_in_progress(self, request, queryset):
        updated = queryset.exclude(status='in_progress').update(
            status='in_progress', resolved_at=None, updated_at=timezone.now()
        )
        self.message_user(request, f"Marked {updated} request(s) as in progress.", messages.SUCCESS)

    @admin.action(description="Mark selected requests as resolved")
    def mark_resolved(self, request, queryset):
        updated = queryset.exclude(status='resolved').update(
            status='resolved', resolved_at=timezone.now(), updated_at=timezone.now()
        )
        self.message_user(request, f"Marked {updated} request(s) as resolved.", messages.SUCCESS)

    # New replies written here are stamped as staff replies from the signed-in admin
    def save_formset(self, request, form, formset, change):
        if formset.model is not SupportReply:
            return super().save_formset(request, form, formset, change)

        replies = formset.save(commit=False)   # this must come first
        for obj in formset.deleted_objects:
            obj.delete()
        for reply in replies:
            if not reply.pk:
                reply.author = request.user
                reply.is_staff_reply = True
                if reply.request.status == 'pending':
                    reply.request.status = 'in_progress'
                reply.request.save()
            reply.save()
            ActivityLog.objects.create(
                    user=request.user,
                    action='support_reply',
                    description=f"Replied to support request #{reply.request_id} in admin",
                    ip_address=request.META.get('REMOTE_ADDR'),
                )
        formset.save_m2m()


# ---------- Announcements ----------

class AnnouncementAdmin(admin.ModelAdmin):
    list_display = ('title', 'status', 'created_by', 'created_at', 'published_at')
    list_filter = ('status',)
    search_fields = ('title', 'body')
    readonly_fields = ('created_by', 'created_at', 'published_at')
    actions = ['publish_selected', 'unpublish_selected']

    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by = request.user
        if obj.status == 'published' and not obj.published_at:
            obj.published_at = timezone.now()
        super().save_model(request, obj, form, change)

    @admin.action(description="Publish selected announcements")
    def publish_selected(self, request, queryset):
        updated = queryset.exclude(status='published').update(status='published', published_at=timezone.now())
        self.message_user(request, f"Published {updated} announcement(s).", messages.SUCCESS)

    @admin.action(description="Unpublish selected announcements (back to draft)")
    def unpublish_selected(self, request, queryset):
        updated = queryset.filter(status='published').update(status='draft')
        self.message_user(request, f"Moved {updated} announcement(s) back to draft.", messages.SUCCESS)


# ---------- System settings ----------

class SystemSettingAdmin(admin.ModelAdmin):
    list_display = ('key', 'value', 'description')
    search_fields = ('key', 'value')


# ---------- Register everything ----------

admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)
admin.site.register(Profile, ProfileAdmin)
admin.site.register(ActivityLog, ActivityLogAdmin)
admin.site.register(UserSession, UserSessionAdmin)
admin.site.register(SupportRequest, SupportRequestAdmin)
admin.site.register(Announcement, AnnouncementAdmin)
admin.site.register(SystemSetting, SystemSettingAdmin)