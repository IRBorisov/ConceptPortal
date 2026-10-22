''' Views: agent RSModel interpretation read/write (API key auth). '''
from __future__ import annotations

from django.http import HttpResponse
from drf_spectacular.utils import extend_schema
from rest_framework import status as c
from rest_framework.request import Request
from rest_framework.response import Response

from apps.library.models import LibraryItem, LibraryItemType
from apps.rsform.models import Constituenta
from apps.rsform.serializers import CstListSerializer
from apps.rsmodel import serializers as model_serializers
from apps.rsmodel.mutations import (
    clear_constituent_values,
    require_bound_schema,
    reset_constituent_values,
    set_constituent_values,
)

from .base import AgentItemView


class AgentModelBase(AgentItemView):
    ''' Shared lookup for agent model routes. '''

    def _get_model(self, pk: int) -> LibraryItem:
        return self._get_item(pk, LibraryItemType.RSMODEL)


@extend_schema(
    tags=['Agents'],
    summary='Get conceptual model details, including interpretations',
    responses={c.HTTP_200_OK: model_serializers.RSModelSerializer},
)
class AgentModelDetailsView(AgentModelBase):
    ''' Agent: model details. '''

    def get(self, request: Request, pk: int) -> HttpResponse:
        item = self._get_model(pk)
        self._require_read(item)
        return Response(model_serializers.RSModelSerializer(item).data)


@extend_schema(
    tags=['Agents'],
    summary='Set interpretation values for constituents',
    request=model_serializers.CstDataUpdateSerializer(many=True),
    responses={c.HTTP_200_OK: model_serializers.RSModelSerializer},
)
class AgentModelSetValueView(AgentModelBase):
    ''' Agent: upsert interpretation bindings. '''
    agent_action = 'model.set_value'

    def post(self, request: Request, pk: int) -> HttpResponse:
        item = self._get_model(pk)
        self._require_edit(item)
        serializer = model_serializers.CstDataUpdateSerializer(
            data=request.data,
            context={'schema': require_bound_schema(item)},
            many=True,
        )
        serializer.is_valid(raise_exception=True)
        set_constituent_values(item, serializer.validated_data, request)
        count = len(serializer.validated_data)
        self._log(
            'model.set_value',
            c.HTTP_200_OK,
            summary=f'Set {count} interpretation(s)',
            item=item,
        )
        return Response(model_serializers.RSModelSerializer(item).data)


@extend_schema(
    tags=['Agents'],
    summary='Clear interpretation values for constituents',
    request=CstListSerializer,
    responses={c.HTTP_200_OK: model_serializers.RSModelSerializer},
)
class AgentModelClearValuesView(AgentModelBase):
    ''' Agent: delete selected interpretation bindings. '''
    agent_action = 'model.clear_values'

    def post(self, request: Request, pk: int) -> HttpResponse:
        item = self._get_model(pk)
        self._require_edit(item)
        serializer = CstListSerializer(
            data=request.data,
            context={'schema': require_bound_schema(item)},
        )
        serializer.is_valid(raise_exception=True)
        constituents: list[Constituenta] = serializer.validated_data['items']
        clear_constituent_values(item, constituents, request)
        self._log(
            'model.clear_values',
            c.HTTP_200_OK,
            summary=f'Cleared {len(constituents)} interpretation(s)',
            item=item,
        )
        return Response(model_serializers.RSModelSerializer(item).data)


@extend_schema(
    tags=['Agents'],
    summary='Reset all interpretation values',
    request=None,
    responses={c.HTTP_200_OK: model_serializers.RSModelSerializer},
)
class AgentModelResetAllView(AgentModelBase):
    ''' Agent: delete every interpretation binding. '''
    agent_action = 'model.reset_all'

    def post(self, request: Request, pk: int) -> HttpResponse:
        item = self._get_model(pk)
        self._require_edit(item)
        require_bound_schema(item)
        reset_constituent_values(item, request)
        self._log(
            'model.reset_all',
            c.HTTP_200_OK,
            summary='Reset all interpretations',
            item=item,
        )
        return Response(model_serializers.RSModelSerializer(item).data)
