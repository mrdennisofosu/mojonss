from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from .models import Profile

# This allows you to edit the Profile directly inside the User page
class ProfileInline(admin.StackedInline):
    model = Profile
    can_delete = False
    verbose_name_plural = 'Profile'

# We extend the default UserAdmin to include the Profile inline
class CustomUserAdmin(UserAdmin):
    inlines = (ProfileInline,)
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff')

# Register the models
admin.site.unregister(User) # Unregister the default User admin
admin.site.register(User, CustomUserAdmin) # Register our custom User admin
admin.site.register(Profile) # Register the Profile model separately as well