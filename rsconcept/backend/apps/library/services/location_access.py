''' Location write authorization helpers. '''
from django.core.exceptions import PermissionDenied
from rest_framework.serializers import ValidationError

from shared import messages as msg

from ..models import LocationHead, validate_location


def assert_can_write_location(user, location: str) -> None:
    ''' Forbid non-staff writes into the shared library ``/L``. '''
    if location.startswith(LocationHead.LIBRARY) and not getattr(user, 'is_staff', False):
        raise PermissionDenied()


def validate_writable_location(user, location: str) -> str:
    ''' Validate location format and shared-library write permission. '''
    if not validate_location(location):
        raise ValidationError({'location': msg.invalidLocation()})
    assert_can_write_location(user, location)
    return location
