from django import forms
from django.contrib import admin, messages
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from django.contrib.sessions.models import Session
from django.utils import timezone

from .models import (
    Profile, ActivityLog, UserSession, SystemSetting,
    SupportRequest, SupportReply, Announcement,
)
from .settings_views import DEFAULTS, GROUPS, coerce_setting, stored_text
from .user_views import make_temporary_password

# Titles shown at the top of the admin site
admin.site.site_header = "Mojo Administration"
admin.site.site_title = "Mojo Admin"
admin.site.index_title = "Manage users, sessions and activity"


def log_admin_action(request, action, description):
    """Write what an admin did in the Django admin to the activity log."""
    ActivityLog.objects.create(
        user=request.user,
        action=action,
        description=description,
        ip_address=request.META.get('REMOTE_ADDR'),
    )


# ---------- Users and profiles ----------

class ProfileInline(admin.StackedInline):
    model = Profile
    can_delete = False
    verbose_name_plural = 'Profile'


class CustomUserAdmin(UserAdmin):
    inlines = (ProfileInline,)
    list_display = (
        'username', 'email', 'first_name', 'last_name',
        'app_role', 'app_status', 'is_staff', 'is_active', 'date_joined',
    )
    list_filter = ('profile__role', 'profile__status', 'is_staff', 'is_superuser', 'is_active')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    list_select_related = ('profile',)
    actions = ['reset_temporary_password', 'mark_accounts_active', 'mark_accounts_inactive']

    @admin.display(description='App role', ordering='profile__role')
    def app_role(self, obj):
        return getattr(getattr(obj, 'profile', None), 'role', '-')

    @admin.display(description='App status', ordering='profile__status')
    def app_status(self, obj):
        return getattr(getattr(obj, 'profile', None), 'status', '-')

    @admin.action(description="Reset password to a new temporary password (one user at a time)")
    def reset_temporary_password(self, request, queryset):
        if queryset.count() != 1:
            self.message_user(request, "Select exactly one user to reset.", messages.ERROR)
            return

        user = queryset.first()
        if user == request.user:
            self.message_user(
                request,
                "Use the normal Change password form for your own account.",
                messages.ERROR,
            )
            return

        password = make_temporary_password()
        user.set_password(password)
        user.save(update_fields=['password'])

        # Sign out every device that was using the old password
        keys = list(UserSession.objects.filter(user=user).values_list('session_key', flat=True))
        Session.objects.filter(session_key__in=keys).delete()
        UserSession.objects.filter(user=user).delete()

        log_admin_action(request, 'password_change', f"Reset the password of {user.username} in admin")
        self.message_user(
            request,
            f"New temporary password for {user.username}: {password}  "
            "(shown only once, so copy it now and send it to the user)",
            messages.WARNING,
        )

    def _set_status(self, request, queryset, status):
        count = 0
        for user in queryset:
            profile, _ = Profile.objects.get_or_create(user=user)
            profile.status = status
            profile.save()
            count += 1
        log_admin_action(request, 'status_change', f"Set {count} account(s) to {status} in admin")
        self.message_user(request, f"Marked {count} account(s) as {status}.", messages.SUCCESS)

    @admin.action(description="Mark selected accounts as active")
    def mark_accounts_active(self, request, queryset):
        self._set_status(request, queryset, 'active')

    @admin.action(description="Mark selected accounts as inactive")
    def mark_accounts_inactive(self, request, queryset):
        self._set_status(request, queryset, 'inactive')


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
            log_admin_action(
                request,
                'support_reply',
                f"Replied to support request #{reply.request_id} in admin",
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

SETTING_DESCRIPTIONS = {
    "appName": "Application name",
    "supportEmail": "Email address people contact for help",
    "publicRegistrationEnabled": "true = anyone can register. false = only admins can create accounts.",
    "minPasswordLength": "Minimum password length (generated passwords are never shorter)",
    "requireEmailVerification": "true or false",
    "maxFailedAttempts": "Failed sign-ins allowed (whole number)",
    "lockoutMinutes": "Lockout duration in minutes (whole number)",
    "sessionTimeoutMinutes": "Session timeout in minutes (whole number)",
    "allowRememberMe": "true or false",
}

KEY_TO_GROUP = {key: group for group, keys in GROUPS.items() for key in keys}


def ensure_default_settings():
    """Make sure every setting the app knows has a row, so all of them show in admin."""
    for key, default in DEFAULTS.items():
        row, created = SystemSetting.objects.get_or_create(
            key=key,
            defaults={
                'value': stored_text(default),
                'description': SETTING_DESCRIPTIONS.get(key, ''),
            },
        )
        if not created:
            changed = []
            if row.value.strip() == '':
                row.value = stored_text(default)
                changed.append('value')
            if not row.description:
                row.description = SETTING_DESCRIPTIONS.get(key, '')
                changed.append('description')
            if changed:
                row.save(update_fields=changed)


class SystemSettingForm(forms.ModelForm):
    """Checks the value the same way the API does, so a bad value cannot be saved."""

    class Meta:
        model = SystemSetting
        fields = '__all__'

    def clean_value(self):
        value = self.cleaned_data['value']
        key = self.instance.key
        if key in DEFAULTS:
            try:
                return stored_text(coerce_setting(key, value))
            except ValueError as error:
                raise forms.ValidationError(str(error))
        return value


class SystemSettingAdmin(admin.ModelAdmin):
    form = SystemSettingForm
    list_display = ('key', 'section', 'value', 'default_value', 'description')
    search_fields = ('key', 'value', 'description')
    readonly_fields = ('key',)
    ordering = ('key',)
    actions = ['turn_on', 'turn_off', 'reset_to_defaults']

    # The app only knows these settings, so none can be added or deleted
    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def changelist_view(self, request, extra_context=None):
        ensure_default_settings()
        return super().changelist_view(request, extra_context)

    @admin.display(description='Section')
    def section(self, obj):
        return KEY_TO_GROUP.get(obj.key, '-').title()

    @admin.display(description='Default')
    def default_value(self, obj):
        return stored_text(DEFAULTS[obj.key]) if obj.key in DEFAULTS else '-'

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        log_admin_action(request, 'status_change', f"Set system setting {obj.key} to {obj.value} in admin")

    def _set_flags(self, request, queryset, flag):
        changed = []
        for row in queryset:
            if isinstance(DEFAULTS.get(row.key), bool):
                row.value = stored_text(flag)
                row.save(update_fields=['value'])
                changed.append(row.key)

        if changed:
            log_admin_action(request, 'status_change', f"Set {', '.join(changed)} to {stored_text(flag)} in admin")
            self.message_user(request, f"Set {', '.join(changed)} to {stored_text(flag)}.", messages.SUCCESS)
        else:
            self.message_user(request, "Select at least one yes/no setting (true or false).", messages.WARNING)

    @admin.action(description="Turn selected yes/no settings ON (true)")
    def turn_on(self, request, queryset):
        self._set_flags(request, queryset, True)

    @admin.action(description="Turn selected yes/no settings OFF (false)")
    def turn_off(self, request, queryset):
        self._set_flags(request, queryset, False)

    @admin.action(description="Reset selected settings to their defaults")
    def reset_to_defaults(self, request, queryset):
        names = []
        for row in queryset:
            if row.key in DEFAULTS:
                row.value = stored_text(DEFAULTS[row.key])
                row.save(update_fields=['value'])
                names.append(row.key)

        if names:
            log_admin_action(request, 'status_change', f"Reset {', '.join(names)} to defaults in admin")
        self.message_user(request, f"Reset {len(names)} setting(s) to their defaults.", messages.SUCCESS)


# ---------- Register everything ----------

admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)
admin.site.register(Profile, ProfileAdmin)
admin.site.register(ActivityLog, ActivityLogAdmin)
admin.site.register(UserSession, UserSessionAdmin)
admin.site.register(SupportRequest, SupportRequestAdmin)
admin.site.register(Announcement, AnnouncementAdmin)
admin.site.register(SystemSetting, SystemSettingAdmin)