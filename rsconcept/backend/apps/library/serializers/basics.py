''' Basic serializers that do not interact with database. '''
from rest_framework import serializers

from shared import messages as msg
from shared.serializers import StrictSerializer

from ..models import AccessPolicy, LibraryItemType, validate_location
from ..services.context_search import ALL_CONTEXT_FIELDS
from ..utils import MAX_LIBRARY_ITEM_ID, MAX_LIBRARY_ITEMS_BY_IDS


class LocationSerializer(StrictSerializer):
    ''' Serializer: Item location. '''
    location = serializers.CharField(max_length=500)

    def validate(self, attrs):
        attrs = super().validate(attrs)
        if not validate_location(attrs['location']):
            raise serializers.ValidationError({
                'location': msg.invalidLocation()
            })
        return attrs


class RenameLocationSerializer(StrictSerializer):
    ''' Serializer: rename location. '''
    target = serializers.CharField(max_length=500)
    new_location = serializers.CharField(max_length=500)

    def validate(self, attrs):
        attrs = super().validate(attrs)
        if not validate_location(attrs['target']):
            raise serializers.ValidationError({
                'target': msg.invalidLocation()
            })
        if not validate_location(attrs['target']):
            raise serializers.ValidationError({
                'new_location': msg.invalidLocation()
            })
        return attrs


class AccessPolicySerializer(StrictSerializer):
    ''' Serializer: Constituenta renaming. '''
    access_policy = serializers.CharField()

    def validate(self, attrs):
        attrs = super().validate(attrs)
        if not attrs['access_policy'] in AccessPolicy.values:
            raise serializers.ValidationError({
                'access_policy': msg.invalidEnum(attrs['access_policy'])
            })
        return attrs


class LibraryContextSearchSerializer(StrictSerializer):
    ''' Serializer: library context search query parameters. '''
    q = serializers.CharField(required=False, allow_blank=True, default='')
    search_fields = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text='Comma-separated field names'
    )
    admin = serializers.BooleanField(required=False, default=False)
    location = serializers.CharField(required=False, allow_blank=True, default='')
    subfolders = serializers.BooleanField(required=False, default=False)
    item_type = serializers.CharField(required=False, allow_blank=True, default='')

    def validate_q(self, value: str) -> str:
        return value.strip()

    def validate_location(self, value: str) -> str | None:
        value = value.strip()
        if not value:
            return None
        if not validate_location(value):
            raise serializers.ValidationError(msg.invalidLocation())
        return value

    def validate_item_type(self, value: str) -> str | None:
        value = value.strip()
        if not value:
            return None
        if value not in LibraryItemType.values:
            raise serializers.ValidationError(msg.invalidEnum(value))
        return value

    def validate_search_fields(self, value: str) -> list[str] | None:
        if not value or not value.strip():
            return None
        parts = [part.strip() for part in value.split(',') if part.strip()]
        unknown = [part for part in parts if part not in ALL_CONTEXT_FIELDS]
        if unknown:
            raise serializers.ValidationError(
                f'Unknown fields: {", ".join(unknown)}'
            )
        return parts


class LibraryItemsByIdsSerializer(StrictSerializer):
    ''' Serializer: library items lookup by id list. '''
    ids = serializers.CharField(required=False, allow_blank=True, default='')

    def validate_ids(self, value: str) -> list[int]:
        value = value.strip()
        if not value:
            return []
        result: list[int] = []
        for part in value.split(','):
            part = part.strip()
            if not part:
                continue
            try:
                parsed = int(part)
            except ValueError as exc:
                raise serializers.ValidationError(f'Invalid id: {part}') from exc
            if parsed <= 0 or parsed > MAX_LIBRARY_ITEM_ID:
                raise serializers.ValidationError(f'Invalid id: {part}')
            result.append(parsed)
        if len(result) > MAX_LIBRARY_ITEMS_BY_IDS:
            raise serializers.ValidationError(
                f'Too many ids (max {MAX_LIBRARY_ITEMS_BY_IDS})'
            )
        return result
