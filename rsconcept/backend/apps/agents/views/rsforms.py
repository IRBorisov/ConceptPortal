''' Views: agent RSForm read/write (API key auth). '''
from __future__ import annotations

from typing import cast

from django.db import transaction
from django.http import HttpResponse
from drf_spectacular.utils import extend_schema
from rest_framework import status as c
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.library.models import LibraryItem, LibraryItemType, LocationHead
from apps.library.serializers import LibraryItemCreateSerializer, VersionCreateSerializer
from apps.oss.models import Inheritance, PropagationFacade
from apps.rsform import models as rs_models
from apps.rsform import serializers as rs_serializers
from shared import messages as msg
from shared import permissions as shared_permissions

from ..authentication import ApiKeyAuthentication
from ..permissions import IsApiKeyAuthenticated
from ..services.audit import api_key_from_request, log_agent_action
from ..throttling import AgentsRateThrottle


class AgentRsformBase(APIView):
    ''' Shared auth for agent RSForm routes. '''
    authentication_classes = [ApiKeyAuthentication]
    permission_classes = [IsApiKeyAuthenticated]
    throttle_classes = [AgentsRateThrottle]

    def _get_rsform(self, pk: int) -> LibraryItem:
        try:
            item = LibraryItem.objects.get(pk=pk, item_type=LibraryItemType.RSFORM)
        except LibraryItem.DoesNotExist as exc:
            raise NotFound() from exc
        return item

    def _require_read(self, item: LibraryItem) -> None:
        if not shared_permissions.can_read_library_item(self.request.user, item):
            raise PermissionDenied()

    def _require_edit(self, item: LibraryItem) -> None:
        if not shared_permissions.can_edit_item(self.request.user, item):
            raise PermissionDenied()

    def _log(self, action: str, status_code: int, summary: str = '', item: LibraryItem | None = None) -> None:
        log_agent_action(
            user=self.request.user,
            api_key=api_key_from_request(self.request),
            action=action,
            status_code=status_code,
            summary=summary,
            item=item,
        )


@extend_schema(
    tags=['Agents'],
    summary='Create RSForm library item',
    request=LibraryItemCreateSerializer,
    responses={c.HTTP_201_CREATED: rs_serializers.RSFormParseSerializer},
)
class AgentRsformCreateView(AgentRsformBase):
    ''' Agent: create empty RSForm. '''

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

    def patch(self, request: Request, pk: int) -> HttpResponse:
        item = self._get_rsform(pk)
        self._require_edit(item)
        if Inheritance.objects.filter(child__schema_id=item.pk).exists():
            from rest_framework.serializers import ValidationError
            raise ValidationError({'data': msg.importIntoInherited()})

        serializer = rs_serializers.RSFormImportJsonSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            validated = serializer.validated_data
            version_data = {
                'title': validated['title'],
                'alias': validated['alias'],
                'description': validated['description'],
                'items': validated['items'],
                'attribution': validated.get('attribution', []),
            }
            data = rs_serializers.RSFormSerializer(item).to_versioned_data() | version_data
            PropagationFacade().before_delete_schema(item.pk)
            rs_serializers.RSFormSerializer(item).restore_from_version(data)
            PropagationFacade().after_create_cst(
                list(rs_models.RSFormCached(item.pk).constituentsQ().order_by('order'))
            )
            item.save(update_fields=['time_update'])

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

    def post(self, request: Request, pk: int) -> HttpResponse:
        item = self._get_rsform(pk)
        if not request.user.is_staff and request.user != item.owner:
            raise PermissionDenied()

        version_input = VersionCreateSerializer(data=request.data)
        version_input.is_valid(raise_exception=True)
        data = rs_serializers.RSFormSerializer(item).to_versioned_data()
        items: list[int] = [] if 'items' not in request.data else request.data['items']
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

    def post(self, request: Request, pk: int) -> HttpResponse:
        item = self._get_rsform(pk)
        self._require_edit(item)
        serializer = rs_serializers.CstCreateSerializer(data=request.data, context={'schema': item})
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        insert_after = data.get('insert_after')

        with transaction.atomic():
            propagation = PropagationFacade()
            schema = propagation.get_schema(item.pk)
            new_cst = schema.create_cst(data, insert_after)
            propagation.after_create_cst([new_cst])
            item.save(update_fields=['time_update'])

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

        with transaction.atomic():
            propagation = PropagationFacade()
            schema = propagation.get_schema(item.pk)
            old_data = schema.update_cst(cst.pk, data)
            propagation.after_update_cst(item.pk, cst.pk, data, old_data)
            if 'alias' in data and data['alias'] != cst.alias:
                cst.refresh_from_db()
                changed_type = 'cst_type' in data and cst.cst_type != data['cst_type']
                mapping = {cst.alias: data['alias']}
                cst.alias = data['alias']
                if changed_type:
                    cst.cst_type = data['cst_type']
                cst.save()
                schema.apply_mapping(mapping=mapping, change_aliases=False)
                if changed_type:
                    propagation.after_change_cst_type(
                        item.pk, cst.pk, cast(rs_models.CstType, cst.cst_type)
                    )
            item.save(update_fields=['time_update'])

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

    def post(self, request: Request, pk: int) -> HttpResponse:
        item = self._get_rsform(pk)
        self._require_edit(item)
        serializer = rs_serializers.CstListSerializer(data=request.data, context={'schema': item})
        serializer.is_valid(raise_exception=True)
        cst_list: list[rs_models.Constituenta] = serializer.validated_data['items']

        with transaction.atomic():
            schema = rs_models.RSForm(item)
            PropagationFacade().before_delete_cst(item.pk, [cst.pk for cst in cst_list])
            schema.delete_cst(cst_list)
            item.save(update_fields=['time_update'])

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

    def post(self, request: Request, pk: int) -> HttpResponse:
        item = self._get_rsform(pk)
        self._require_edit(item)
        serializer = rs_serializers.CstSubstituteSerializer(
            data=request.data, context={'schema': item}
        )
        serializer.is_valid(raise_exception=True)
        substitutions: list[tuple[rs_models.Constituenta, rs_models.Constituenta]] = []

        with transaction.atomic():
            schema = rs_models.RSForm(item)
            for substitution in serializer.validated_data['substitutions']:
                original = cast(rs_models.Constituenta, substitution['original'])
                replacement = cast(rs_models.Constituenta, substitution['substitution'])
                substitutions.append((original, replacement))
            PropagationFacade().before_substitute(item.pk, substitutions)
            schema.substitute(substitutions)
            item.save(update_fields=['time_update'])

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

    def patch(self, request: Request, pk: int) -> HttpResponse:
        item = self._get_rsform(pk)
        self._require_edit(item)
        serializer = rs_serializers.CstMoveSerializer(data=request.data, context={'schema': item})
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            schema = rs_models.RSForm(item)
            schema.move_cst(
                target=serializer.validated_data['items'],
                destination=serializer.validated_data['move_to'],
            )
            item.save(update_fields=['time_update'])

        self._log('rsform.move_cst', c.HTTP_200_OK, summary='Moved constituents', item=item)
        return Response(rs_serializers.RSFormParseSerializer(item).data)
