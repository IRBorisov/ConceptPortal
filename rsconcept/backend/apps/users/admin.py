''' Admin: User profile and Authorization. '''
from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.forms import AdminPasswordChangeForm, AdminUserCreationForm, UserChangeForm
from django.core.exceptions import ValidationError

from shared.ExportCsvMixin import ExportCsvMixin

from .validators import forbid_at_in_username, forbid_trailing_password_space

User = get_user_model()
admin.site.unregister(User)


def _reject_trailing_password_spaces(form, *field_names: str) -> None:
    for field_name in field_names:
        password = form.cleaned_data.get(field_name)
        if not isinstance(password, str):
            continue
        try:
            forbid_trailing_password_space(password)
        except ValidationError as error:
            form.add_error(field_name, error)


class PortalUserCreationForm(AdminUserCreationForm):
    ''' Admin create-user form. Usernames cannot contain @, passwords cannot end with a space. '''

    def clean_username(self):
        username = super().clean_username()
        if isinstance(username, str):
            forbid_at_in_username(username)
        return username

    def clean(self):
        cleaned = super().clean()
        _reject_trailing_password_spaces(self, 'password1', 'password2')
        return cleaned


class PortalUserChangeForm(UserChangeForm):
    ''' Admin edit-user form. Usernames cannot contain @. '''

    def clean_username(self):
        username = self.cleaned_data.get('username')
        if isinstance(username, str):
            forbid_at_in_username(username)
        return username


class PortalAdminPasswordChangeForm(AdminPasswordChangeForm):
    ''' Admin password change. A new password cannot end with a space. '''

    def clean(self):
        cleaned = super().clean()
        _reject_trailing_password_spaces(self, 'password1', 'password2')
        return cleaned


@admin.register(User)
class CustomUserAdmin(ExportCsvMixin, UserAdmin):
    ''' Admin model: User. '''
    form = PortalUserChangeForm
    add_form = PortalUserCreationForm
    change_password_form = PortalAdminPasswordChangeForm
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
    actions = ['export_as_csv']
