from django.db import models
from django.contrib.auth.models import User

class Profile(models.Model):
    ROLE_CHOICES = [
        ('admin', 'Administrator'),
        ('user', 'Standard User'),
    ]

    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('pending', 'Pending'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')
    email_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.role}"

class ActivityLog(models.Model):
    ACTION_CHOICES = [
        ('login', 'Login'),
        ('login_failed', 'Failed Login'),
        ('logout', 'Logout'),
        ('password_change', 'Password Change'),
        ('role_change', 'Role Change'),
        ('status_change', 'Status Change'),
        ('user_create', 'User Creation'),
        ('support_request', 'Support Request'),
        ('support_reply', 'Support Reply'),
        ('announcement', 'Announcement'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities')
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    description = models.TextField()
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.action} at {self.created_at}"

class UserSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sessions')
    session_key = models.CharField(max_length=128, unique=True)
    device = models.CharField(max_length=255)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    location = models.CharField(max_length=255, default="Unknown")
    is_trusted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    last_activity = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.device}"

class SystemSetting(models.Model):
    key = models.CharField(max_length=100, unique=True)
    value = models.TextField()
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.key}: {self.value}"

# class SupportRequest(models.Model):
#     STATUS_CHOICES = [
#         ('pending', 'Pending'),
#         ('in_progress', 'In progress'),
#         ('resolved', 'Resolved'),
#     ]

#     user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='support_requests')
#     subject = models.CharField(max_length=255)
#     message = models.TextField()
#     status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)
#     resolved_at = models.DateTimeField(null=True, blank=True)
class SupportRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In progress'),
        ('resolved', 'Resolved'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='support_requests')
    subject = models.CharField(max_length=255)
    message = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)  # content_views and admin.py use this
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.subject}"

# class SupportReply(models.Model):
#     request = models.ForeignKey(SupportRequest, on_delete=models.CASCADE, related_name='replies')
#     author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='support_replies')
#     message = models.TextField()
#     is_staff_reply = models.BooleanField(default=False)
#     created_at = models.DateTimeField(auto_now_add=True)

#     class Meta:
#         ordering = ['created_at']
#         verbose_name_plural = 'support replies'

class SupportReply(models.Model):
    # related_name='replies' is what makes request.replies.all() work
    request = models.ForeignKey(SupportRequest, on_delete=models.CASCADE, related_name='replies')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField()
    is_staff_reply = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']  # oldest first, so the thread reads top to bottom

    def __str__(self):
        return f"Reply by {self.author.username} on '{self.request.subject}'"

# class Announcement(models.Model):
#     STATUS_CHOICES = [('draft', 'Draft'), ('published', 'Published')]

#     title = models.CharField(max_length=200)
#     body = models.TextField()  # the API sends and receives this as "content"
#     status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='draft')
#     created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='announcements')
#     created_at = models.DateTimeField(auto_now_add=True)
#     published_at = models.DateTimeField(null=True, blank=True)

class Announcement(models.Model):
    STATUS_CHOICES = [('draft', 'Draft'), ('published', 'Published')]
    title = models.CharField(max_length=120)
    body = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    created_by = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)
    published_at = models.DateTimeField(null=True, blank=True)
    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.status})"