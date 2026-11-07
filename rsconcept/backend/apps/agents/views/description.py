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


class DescriptionSerializer(StrictSerializer):
    """No schema, title or constituent fields are accepted."""
    expected_time_update = serializers.DateTimeField()
    description = serializers.CharField(allow_blank=True, trim_whitespace=False, max_length=100000)


class AgentRsformDescriptionView(AgentItemView):
    """Compare and update only the description, preserving all schema content."""
    agent_action = 'rsform.description'

    @extend_schema(tags=['Agents'], request=DescriptionSerializer, responses={200: dict, 409: dict})
    def post(self, request, pk: int):
        if not isinstance(request.data, dict):
            raise ValidationError('Expected a JSON object')
        serializer = DescriptionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        item = self._get_item(pk, LibraryItemType.RSFORM)
        self._require_edit(item)
        expected = serializer.validated_data['expected_time_update']
        with transaction.atomic():
            revision = max(timezone.now(), expected + timedelta(microseconds=1))
            # First statement is a conditional write, also safe for SQLite waiting writers.
            claimed = LibraryItem.objects.filter(pk=item.pk, time_update=expected).update(
                description=serializer.validated_data['description'], time_update=revision,
            )
            if not claimed:
                raise PublicationConflict()
            item.refresh_from_db()
            # Roll back the write if permissions changed before the claim acquired its lock.
            self._require_edit(item)
            self._log('rsform.description', status.HTTP_200_OK, summary='Updated schema description', item=item)
            return Response({'id': item.pk, 'description': item.description, 'time_update': item.time_update})
