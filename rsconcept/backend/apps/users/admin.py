''' Admin: User profile and Authorization. '''
from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin

User = get_user_model()


class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets
    list_display = (
        'username',
        'email',
        'first_name',
        'last_name',
        'is_staff',
        'is_active',
        'date_joined',
        'last_login')
    ordering = ['date_joined', 'username']
    search_fields = ['email', 'first_name', 'last_name', 'username']
    list_filter = ['is_staff', 'is_superuser', 'is_active']


admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)
