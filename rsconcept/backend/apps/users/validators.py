''' Validators: username and password. '''
from django.core.exceptions import ValidationError

from shared import messages as msg


def forbid_at_in_username(value: str) -> None:
    ''' Login treats "@" as an email, so a username must not contain it. '''
    if '@' in value:
        raise ValidationError(msg.usernameAtSign())


def forbid_trailing_password_space(value: str) -> None:
    ''' Reject a password that ends with whitespace instead of stripping it. '''
    if value != value.rstrip():
        raise ValidationError(msg.passwordTrailingSpace())
