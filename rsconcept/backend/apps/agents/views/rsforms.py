''' Views: agent RSForm read/write (API key auth). '''
from __future__ import annotations

from typing import cast

from django.http import HttpResponse
from drf_spectacular.utils import extend_schema
from rest_framework import status as c
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.request import Request
from rest_framework.response import Response

from apps.library.models import LibraryItem, LibraryItemType, LocationHead
from apps.library.serializers import LibraryItemCreateSerializer, VersionCreateSerializer
from apps.oss.models import Inheritance
from apps.rsform import models as rs_models
from apps.rsform import serializers as rs_serializers
from apps.rsform.mutations import (
    create_constituenta,
    delete_constituents,
    move_constituents,
    replace_schema_content,
    substitute_constituents,
    update_constituenta,
)
from shared import messages as msg

from .base import AgentItemView


class AgentRsformBase(AgentItemView):
    ''' Shared auth for agent RSForm routes. '''

    def _get_rsform(self, pk: int) -> LibraryItem:
        ''' Load a conceptual schema or answer 404 for another library type. '''
        return self._get_item(pk, LibraryItemType.RSFORM)


@extend_schema(
    tags=['Agents'],
    summary='Create RSForm library item',
    request=LibraryItemCreateSerializer,
    responses={c.HTTP_201_CREATED: rs_serializers.RSFormParseSerializer},
)
class AgentRsformCreateView(AgentRsformBase):
    ''' Agent: create empty RSForm. '''
    agent_action = 'rsform.create'
    agent_heavy = True

    def post(self, request: Request) -> HttpResponse:
        data = dict(request.data)
        data['item_type'] = LibraryItemType.RSFORM
        serializer = LibraryItemCreateSerializer(data=data)
        serializer.is_valid(raise_exception=True)

        location = serializer.validated_data.get('location', '')
        if location.startswith(LocationHead.LIBRARY) and not request.user.is_staff:
            raise PermissionDenied()

        item = serializer.save(owner=request.user)
        self._log('rsform.create', c.HTTP_201_CREATED, summary=f'Created {item.alias}', item=item)
        return Response(
            status=c.HTTP_201_CREATED,
            data=rs_serializers.RSFormParseSerializer(item).data,
        )


@extend_schema(
    tags=['Agents'],
    summary='Get full RSForm details',
    responses={c.HTTP_200_OK: rs_serializers.RSFormParseSerializer},
)
class AgentRsformDetailsView(AgentRsformBase):
    ''' Agent: schema details for rstool importData. '''

    def get(self, request: Request, pk: int) -> HttpResponse:
        item = self._get_rsform(pk)
        self._require_read(item)
        return Response(rs_serializers.RSFormParseSerializer(item).data)


@extend_schema(
    tags=['Agents'],
    summary='Replace RSForm content (load-json / exportPortal)',
    request=rs_serializers.RSFormImportJsonSerializer,
    responses={c.HTTP_200_OK: rs_serializers.RSFormParseSerializer},
)
class AgentRsformReplaceView(AgentRsformBase):
    ''' Agent: bulk replace schema content. '''
    agent_action = 'rsform.replace'
    agent_heavy = True

    def patch(self, request: Request, pk: int) -> HttpResponse:
        item = self._get_rsform(pk)
        self._require_edit(item)
        if Inheritance.objects.filter(child__schema_id=item.pk).exists():
            raise ValidationError({'data': msg.importIntoInherited()})

        serializer = rs_serializers.RSFormImportJsonSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        replace_schema_content(item, serializer.validated_data)

        item.refresh_from_db()
        self._log('rsform.replace', c.HTTP_200_OK, summary='Replaced schema content', item=item)
        return Response(rs_serializers.RSFormParseSerializer(item).data)


@extend_schema(
    tags=['Agents'],
    summary='Create version snapshot of RSForm',
    request=VersionCreateSerializer,
    responses={c.HTTP_201_CREATED: dict},
)
class AgentRsformCreateVersionView(AgentRsformBase):
    ''' Agent: create version (owner/staff). '''
    agent_action = 'rsform.create_version'
    agent_heavy = True

    def post(self, request: Request, pk: int) -> HttpResponse:
        item = self._get_rsform(pk)
        if not request.user.is_staff and request.user != item.owner:
            raise PermissionDenied()

        version_input = VersionCreateSerializer(data=request.data)
        version_input.is_valid(raise_exception=True)
        data = rs_serializers.RSFormSerializer(item).to_versioned_data()
        body = cast(dict, request.data)
        items: list[int] = [] if 'items' not in body else body['items']
        if items:
            data['items'] = [cst for cst in data['items'] if cst['id'] in items]
        result = rs_models.RSForm(item).create_version(
            version=version_input.validated_data['version'],
            description=version_input.validated_data['description'],
            data=data,
        )
        self._log(
            'rsform.create_version',
            c.HTTP_201_CREATED,
            summary=f'Version {version_input.validated_data["version"]}',
            item=item,
        )
        return Response(
            status=c.HTTP_201_CREATED,
            data={
                'version': result.pk,
                'schema': rs_serializers.RSFormParseSerializer(item).data,
            },
        )


@extend_schema(
    tags=['Agents'],
    summary='Create constituenta',
    request=rs_serializers.CstCreateSerializer,
    responses={c.HTTP_201_CREATED: rs_serializers.NewCstResponse},
)
class AgentCreateConstituentaView(AgentRsformBase):
    ''' Agent: create one constituenta. '''
    agent_action = 'rsform.create_cst'

    def post(self, request: Request, pk: int) -> HttpResponse:
        item = self._get_rsform(pk)
        self._require_edit(item)
        serializer = rs_serializers.CstCreateSerializer(data=request.data, context={'schema': item})
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        insert_after = data.get('insert_after')
        new_cst = create_constituenta(item, data, insert_after)

        self._log(
            'rsform.create_cst',
            c.HTTP_201_CREATED,
            summary=f'Created {new_cst.alias}',
            item=item,
        )
        return Response(
            status=c.HTTP_201_CREATED,
            data={
                'new_cst': rs_serializers.CstInfoSerializer(new_cst).data,
                'schema': rs_serializers.RSFormParseSerializer(item).data,
            },
        )


@extend_schema(
    tags=['Agents'],
    summary='Update constituenta',
    request=rs_serializers.CstUpdateSerializer,
    responses={c.HTTP_200_OK: rs_serializers.RSFormParseSerializer},
)
class AgentUpdateConstituentaView(AgentRsformBase):
    ''' Agent: update constituenta by id (target taken from URL). '''
    agent_action = 'rsform.update_cst'

    def patch(self, request: Request, pk: int, cst_id: int) -> HttpResponse:
        item = self._get_rsform(pk)
        self._require_edit(item)

        payload = dict(request.data)
        if 'item_data' in payload:
            body = {'target': cst_id, 'item_data': payload['item_data']}
        else:
            # Allow flat update body: fields go into item_data
            body = {
                'target': cst_id,
                'item_data': {k: v for k, v in payload.items() if k != 'target'},
            }

        serializer = rs_serializers.CstUpdateSerializer(
            data=body, partial=True, context={'schema': item}
        )
        serializer.is_valid(raise_exception=True)
        cst = cast(rs_models.Constituenta, serializer.validated_data['target'])
        data = serializer.validated_data['item_data']
        update_constituenta(item, cst, data)

        self._log(
            'rsform.update_cst',
            c.HTTP_200_OK,
            summary=f'Updated constituenta {cst_id}',
            item=item,
        )
        return Response(rs_serializers.RSFormParseSerializer(item).data)


@extend_schema(
    tags=['Agents'],
    summary='Delete multiple constituents',
    request=rs_serializers.CstListSerializer,
    responses={c.HTTP_200_OK: rs_serializers.RSFormParseSerializer},
)
class AgentDeleteConstituentsView(AgentRsformBase):
    ''' Agent: delete constituents by id list. '''
    agent_action = 'rsform.delete_cst'

    def post(self, request: Request, pk: int) -> HttpResponse:
        item = self._get_rsform(pk)
        self._require_edit(item)
        serializer = rs_serializers.CstListSerializer(data=request.data, context={'schema': item})
        serializer.is_valid(raise_exception=True)
        cst_list: list[rs_models.Constituenta] = serializer.validated_data['items']
        delete_constituents(item, cst_list)

        aliases = ', '.join(cst.alias for cst in cst_list[:8])
        self._log(
            'rsform.delete_cst',
            c.HTTP_200_OK,
            summary=f'Deleted {len(cst_list)}: {aliases}',
            item=item,
        )
        return Response(rs_serializers.RSFormParseSerializer(item).data)


@extend_schema(
    tags=['Agents'],
    summary='Substitute constituents',
    request=rs_serializers.CstSubstituteSerializer,
    responses={c.HTTP_200_OK: rs_serializers.RSFormParseSerializer},
)
class AgentSubstituteView(AgentRsformBase):
    ''' Agent: substitute. '''
    agent_action = 'rsform.substitute'

    def post(self, request: Request, pk: int) -> HttpResponse:
        item = self._get_rsform(pk)
        self._require_edit(item)
        serializer = rs_serializers.CstSubstituteSerializer(
            data=request.data, context={'schema': item}
        )
        serializer.is_valid(raise_exception=True)
        substitute_constituents(item, serializer.validated_data['substitutions'])

        self._log('rsform.substitute', c.HTTP_200_OK, summary='Substituted constituents', item=item)
        return Response(rs_serializers.RSFormParseSerializer(item).data)


@extend_schema(
    tags=['Agents'],
    summary='Move constituents',
    request=rs_serializers.CstMoveSerializer,
    responses={c.HTTP_200_OK: rs_serializers.RSFormParseSerializer},
)
class AgentMoveCstView(AgentRsformBase):
    ''' Agent: move / reorder constituents. '''
    agent_action = 'rsform.move_cst'

    def patch(self, request: Request, pk: int) -> HttpResponse:
        item = self._get_rsform(pk)
        self._require_edit(item)
        serializer = rs_serializers.CstMoveSerializer(data=request.data, context={'schema': item})
        serializer.is_valid(raise_exception=True)
        move_constituents(item, serializer.validated_data)

        self._log('rsform.move_cst', c.HTTP_200_OK, summary='Moved constituents', item=item)
        return Response(rs_serializers.RSFormParseSerializer(item).data)
