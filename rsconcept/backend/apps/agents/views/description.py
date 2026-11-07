"""Atomic description-only editing for authenticated agents."""
from datetime import timedelta

from django.db import transaction
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework import serializers, status
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError

from apps.library.models import LibraryItem, LibraryItemType
from shared.serializers import StrictSerializer

from .base import AgentItemView
from .publication import PublicationConflict


class DescriptionTextField(serializers.CharField):
    """Accept JSON strings without CharField's numeric-to-text conversion."""

    def to_internal_value(self, data):
        """Check the original JSON type before normal text validation."""
        if not isinstance(data, str):
            self.fail('invalid')
        return super().to_internal_value(data)


class DescriptionSerializer(StrictSerializer):
    """No schema, title or constituent fields are accepted."""
    expected_time_update = serializers.DateTimeField()
    description = DescriptionTextField(allow_blank=True, trim_whitespace=False, max_length=100000)


class AgentRsformDescriptionView(AgentItemView):
    """Compare and update only the description, preserving all schema content."""
    agent_action = 'rsform.description'

    @extend_schema(tags=['Agents'], request=DescriptionSerializer, responses={200: dict, 409: dict})
    def post(self, request, pk: int):
        """Claim the supplied revision and update description within one transaction."""
        if not isinstance(request.data, dict):
            raise ValidationError('Expected a JSON object')
        serializer = DescriptionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        item = self._get_item(pk, LibraryItemType.RSFORM)
        self._require_edit(item)
        expected = serializer.validated_data['expected_time_update']
        try:
            next_revision = expected + timedelta(microseconds=1)
        except OverflowError as exc:
            raise ValidationError({'expected_time_update': 'Revision cannot be advanced.'}) from exc
        with transaction.atomic():
            revision = max(timezone.now(), next_revision)
            # First statement is a conditional write, also safe for SQLite waiting writers.
            claimed = LibraryItem.objects.filter(pk=item.pk, time_update=expected).update(
                description=serializer.validated_data['description'], time_update=revision,
            )
            if not claimed:
                raise PublicationConflict(
                    'Schema changed. Read the current description and revision, then reconsider the edit.'
                )
            item.refresh_from_db()
            # Roll back the write if permissions changed before the claim acquired its lock.
            self._require_edit(item)
            self._log('rsform.description', status.HTTP_200_OK, summary='Updated schema description', item=item)
            return Response({'id': item.pk, 'description': item.description, 'time_update': item.time_update})
