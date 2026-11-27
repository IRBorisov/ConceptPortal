''' Endpoints for RSForm. '''
from typing import cast

from django.db import transaction
from django.db.models import F
from django.http import HttpResponse
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import generics
from rest_framework import status as c
from rest_framework import viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.exceptions import PermissionDenied
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.serializers import ValidationError

from apps.library.models import LibraryItem, LibraryItemType
from apps.library.serializers import LibraryItemSerializer
from apps.library.services.context_search import get_accessible_items_queryset
from apps.oss.models import Inheritance, Operation, OperationType, PropagationFacade
from apps.oss.propagation_batch import propagation_batch
from apps.oss.propagation_state import mark_schema
from apps.users.models import User
from shared import messages as msg
from shared import permissions, utility
from shared.concurrency import ConcurrencyMixin
from shared.utility import ZipMemberTooLarge

from .. import models as m
from .. import serializers as s
from .. import utils
from ..mutations import (
    create_constituenta,
    delete_constituents,
    move_constituents,
    replace_schema_content,
    require_unmanaged_attributions,
    require_unmanaged_constituents,
    substitute_constituents,
    update_constituenta,
)
from ..relativization import create_standalone_relativization, preview_standalone_relativization
from ..serializers.relativization import CreateStandaloneRelativizationSerializer, RelativizationInputSerializer


@extend_schema(tags=['RSForm'])
@extend_schema_view()
class RSFormViewSet(ConcurrencyMixin, viewsets.GenericViewSet, generics.ListAPIView, generics.RetrieveAPIView):
    ''' Endpoint: RSForm operations. '''
    queryset = LibraryItem.objects.filter(item_type=LibraryItemType.RSFORM)
    serializer_class = LibraryItemSerializer

    def _get_item(self) -> LibraryItem:
        return cast(LibraryItem, self.get_object())

    def get_queryset(self):
        if self.action == 'list':
            return get_accessible_items_queryset(self.request.user).filter(
                item_type=LibraryItemType.RSFORM
            )
        return super().get_queryset()

    def get_permissions(self):
        ''' Determine permission class. '''
        if self.action in [
            'load_json',
            'load_trs',
            'create_cst',
            'create_multiple_cst',
            'update_cst',
            'update_crucial',
            'move_cst',
            'delete_multiple_cst',
            'substitute',
            'restore_order',
            'reset_aliases',
            'create_attribution',
            'delete_attribution',
            'clear_attributions'
        ]:
            permission_list = [permissions.ItemEditor]
        elif self.action in [
            'list',
            'retrieve',
            'contents',
            'details',
            'resolve',
        ]:
            permission_list = [permissions.ItemAnyone]
        elif self.action in ['preview_relativization', 'create_relativization']:
            permission_list = [permissions.ItemReader]
        else:
            permission_list = [permissions.ItemEditor]
        return [permission() for permission in permission_list]

    @extend_schema(
        summary='preview standalone relativization',
        request=RelativizationInputSerializer,
        responses={c.HTTP_200_OK: dict, c.HTTP_409_CONFLICT: None},
    )
    @action(detail=True, methods=['post'], url_path='preview-relativization')
    def preview_relativization(self, request: Request, pk) -> Response:
        ''' Compute the projection and propose texts for review. '''
        source = self._get_item()
        serializer = RelativizationInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(preview_standalone_relativization(source, serializer.validated_data, request))

    @extend_schema(
        summary='create a standalone schema by relativization',
        request=CreateStandaloneRelativizationSerializer,
        responses={c.HTTP_201_CREATED: LibraryItemSerializer, c.HTTP_409_CONFLICT: None},
    )
    @action(detail=True, methods=['post'], url_path='create-relativization')
    def create_relativization(self, request: Request, pk) -> Response:
        ''' Save a new schema computed from the source. '''
        source = self._get_item()
        serializer = CreateStandaloneRelativizationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = create_standalone_relativization(source, serializer.validated_data, request)
        return Response(LibraryItemSerializer(result).data, status=c.HTTP_201_CREATED)

    @extend_schema(
        summary='load JSON data into an existing RSForm',
        tags=['RSForm'],
        request=s.RSFormImportJsonSerializer,
        responses={
            c.HTTP_200_OK: s.RSFormParseSerializer,
            c.HTTP_400_BAD_REQUEST: None,
            c.HTTP_403_FORBIDDEN: None,
            c.HTTP_404_NOT_FOUND: None
        }
    )
    @action(detail=True, methods=['patch'], url_path='load-json')
    def load_json(self, request: Request, pk) -> HttpResponse:
        ''' Endpoint: Load JSON into the current schema. '''
        item = self._get_item()
        if Inheritance.objects.filter(child__schema_id=item.pk).exists():
            raise ValidationError({
                'data': msg.importIntoInherited()
            })
        serializer = s.RSFormImportJsonSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        replace_schema_content(item, serializer.validated_data)

        return Response(
            status=c.HTTP_200_OK,
            data=s.RSFormParseSerializer(item).data
        )

    @extend_schema(
        summary='create constituenta',
        tags=['Constituenta'],
        request=s.CstCreateSerializer,
        responses={
            c.HTTP_201_CREATED: s.NewCstResponse,
            c.HTTP_400_BAD_REQUEST: None,
            c.HTTP_403_FORBIDDEN: None,
            c.HTTP_404_NOT_FOUND: None
        }
    )
    @action(detail=True, methods=['post'], url_path='create-cst')
    def create_cst(self, request: Request, pk) -> HttpResponse:
        ''' Create Constituenta. '''
        item = self._get_item()
        serializer = s.CstCreateSerializer(data=request.data, context={'schema': item})
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        insert_after = None if 'insert_after' not in data else data['insert_after']
        new_cst = create_constituenta(item, data, insert_after, request)

        return Response(
            status=c.HTTP_201_CREATED,
            data={
                'new_cst': s.CstInfoSerializer(new_cst).data,
                'schema': s.RSFormParseSerializer(item).data
            }
        )

    @extend_schema(
        summary='create multiple constituenta',
        tags=['Constituenta'],
        request=s.CstBatchCreateSerializer,
        responses={
            c.HTTP_201_CREATED: s.NewMultiCstResponse,
            c.HTTP_400_BAD_REQUEST: None,
            c.HTTP_403_FORBIDDEN: None,
            c.HTTP_404_NOT_FOUND: None
        }
    )
    @action(detail=True, methods=['post'], url_path='create-multiple-cst')
    @propagation_batch
    def create_multiple_cst(self, request: Request, pk) -> HttpResponse:
        ''' Create multiple Constituenta in one request. '''
        item = self._get_item()
        serializer = s.CstBatchCreateSerializer(data=request.data, context={'schema': item})
        serializer.is_valid(raise_exception=True)
        insert_after = serializer.validated_data.get('insert_after')
        items_data = serializer.validated_data['items']

        with transaction.atomic():
            # Lock the parent before constituent/attribution writes, matching publication.
            LibraryItem.objects.filter(pk=item.pk).update(time_update=F('time_update'))
            propagation = PropagationFacade()
            schema = propagation.get_schema(item.pk)
            new_cst_list: list[m.Constituenta] = []
            current_insert_after = insert_after
            for item_data in items_data:
                new_cst = schema.create_cst(item_data, current_insert_after)
                new_cst_list.append(new_cst)
                current_insert_after = new_cst
            propagation.after_create_cst(new_cst_list)
            item.save(update_fields=['time_update'])

        return Response(
            status=c.HTTP_201_CREATED,
            data={
                'cst_list': s.CstInfoSerializer(new_cst_list, many=True).data,
                'schema': s.RSFormParseSerializer(item).data
            }
        )

    @extend_schema(
        summary='update persistent attributes of a given constituenta',
        tags=['RSForm'],
        request=s.CstUpdateSerializer,
        responses={
            c.HTTP_200_OK: s.RSFormParseSerializer,
            c.HTTP_400_BAD_REQUEST: None,
            c.HTTP_403_FORBIDDEN: None,
            c.HTTP_404_NOT_FOUND: None
        }
    )
    @action(detail=True, methods=['patch'], url_path='update-cst')
    def update_cst(self, request: Request, pk) -> HttpResponse:
        ''' Update persistent attributes of a given constituenta. '''
        item = self._get_item()
        serializer = s.CstUpdateSerializer(data=request.data, partial=True, context={'schema': item})
        serializer.is_valid(raise_exception=True)
        cst = cast(m.Constituenta, serializer.validated_data['target'])
        data = serializer.validated_data['item_data']
        update_constituenta(item, cst, data, request, allow_inherited=True)
        return Response(
            status=c.HTTP_200_OK,
            data=s.RSFormParseSerializer(item).data
        )

    @extend_schema(
        summary='update crucial attribute of a given list of constituents',
        tags=['RSForm'],
        request=s.CrucialUpdateSerializer,
        responses={
            c.HTTP_200_OK: s.RSFormParseSerializer,
            c.HTTP_400_BAD_REQUEST: None,
            c.HTTP_403_FORBIDDEN: None,
            c.HTTP_404_NOT_FOUND: None
        }
    )
    @action(detail=True, methods=['patch'], url_path='update-crucial')
    @propagation_batch
    def update_crucial(self, request: Request, pk) -> HttpResponse:
        ''' Update crucial attribute of a given list of constituents. '''
        item = self._get_item()
        serializer = s.CrucialUpdateSerializer(data=request.data, partial=True, context={'schema': item})
        serializer.is_valid(raise_exception=True)
        value: bool = serializer.validated_data['value']

        with transaction.atomic():
            # Lock the parent before constituent/attribution writes, matching publication.
            LibraryItem.objects.filter(pk=item.pk).update(time_update=F('time_update'))
            for cst in serializer.validated_data['target']:
                cst.crucial = value
                cst.save(update_fields=['crucial'])
            mark_schema(item.pk)
            item.save(update_fields=['time_update'])

        return Response(
            status=c.HTTP_200_OK,
            data=s.RSFormParseSerializer(item).data
        )


    @extend_schema(
        summary='execute substitutions',
        tags=['RSForm'],
        request=s.CstSubstituteSerializer,
        responses={
            c.HTTP_200_OK: s.RSFormParseSerializer,
            c.HTTP_400_BAD_REQUEST: None,
            c.HTTP_403_FORBIDDEN: None,
            c.HTTP_404_NOT_FOUND: None
        }
    )
    @action(detail=True, methods=['patch'], url_path='substitute')
    def substitute(self, request: Request, pk) -> HttpResponse:
        ''' Substitute occurrences of constituenta with another one. '''
        item = self._get_item()
        serializer = s.CstSubstituteSerializer(data=request.data, context={'schema': item})
        serializer.is_valid(raise_exception=True)
        substitute_constituents(item, serializer.validated_data['substitutions'], request)

        return Response(
            status=c.HTTP_200_OK,
            data=s.RSFormParseSerializer(item).data
        )

    @extend_schema(
        summary='delete constituents',
        tags=['RSForm'],
        request=s.CstListSerializer,
        responses={
            c.HTTP_200_OK: s.RSFormParseSerializer,
            c.HTTP_400_BAD_REQUEST: None,
            c.HTTP_403_FORBIDDEN: None,
            c.HTTP_404_NOT_FOUND: None
        }
    )
    @action(detail=True, methods=['patch'], url_path='delete-multiple-cst')
    def delete_multiple_cst(self, request: Request, pk) -> HttpResponse:
        ''' Endpoint: Delete multiple Constituents. '''
        item = self._get_item()
        serializer = s.CstListSerializer(data=request.data, context={'schema': item})
        serializer.is_valid(raise_exception=True)
        cst_list: list[m.Constituenta] = serializer.validated_data['items']
        delete_constituents(item, cst_list, request)

        return Response(
            status=c.HTTP_200_OK,
            data=s.RSFormParseSerializer(item).data
        )

    @extend_schema(
        summary='create Attribution',
        tags=['Constituenta'],
        request=s.AttributionCreateSerializer,
        responses={
            c.HTTP_201_CREATED: s.RSFormParseSerializer,
            c.HTTP_400_BAD_REQUEST: None,
            c.HTTP_403_FORBIDDEN: None,
            c.HTTP_404_NOT_FOUND: None
        }
    )
    @action(detail=True, methods=['post'], url_path='create-attribution')
    @propagation_batch
    def create_attribution(self, request: Request, pk) -> HttpResponse:
        ''' Create Attribution. '''
        item = self._get_item()
        serializer = s.AttributionCreateSerializer(data=request.data, context={'schema': item})
        serializer.is_valid(raise_exception=True)
        container = serializer.validated_data['container']
        attribute = serializer.validated_data['attribute']

        with transaction.atomic():
            # Lock the parent before constituent/attribution writes, matching publication.
            LibraryItem.objects.filter(pk=item.pk).update(time_update=F('time_update'))
            if Inheritance.check_share_origin(container.pk, attribute.pk):
                raise ValidationError({
                    'container': msg.deleteInheritedAttribution()
                })

            new_attribution = m.Attribution.objects.create(
                container=container,
                attribute=attribute
            )
            PropagationFacade().after_create_attribution(item.pk, [new_attribution])
            item.save(update_fields=['time_update'])

        return Response(
            status=c.HTTP_201_CREATED,
            data=s.RSFormParseSerializer(item).data
        )

    @extend_schema(
        summary='delete Attribution',
        tags=['RSForm'],
        request=s.AttributionDataSerializer,
        responses={
            c.HTTP_200_OK: s.RSFormParseSerializer,
            c.HTTP_400_BAD_REQUEST: None,
            c.HTTP_403_FORBIDDEN: None,
            c.HTTP_404_NOT_FOUND: None
        }
    )
    @action(detail=True, methods=['patch'], url_path='delete-attribution')
    @propagation_batch
    def delete_attribution(self, request: Request, pk) -> HttpResponse:
        ''' Endpoint: Delete Attribution. '''
        item = self._get_item()
        serializer = s.AttributionDataSerializer(data=request.data, context={'schema': item})
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            # Lock the parent before constituent/attribution writes, matching publication.
            LibraryItem.objects.filter(pk=item.pk).update(time_update=F('time_update'))
            target_query = m.Attribution.objects.filter(
                container=serializer.validated_data['container'],
                attribute=serializer.validated_data['attribute']
            )
            attr = target_query.first()
            if not attr:
                raise ValidationError({
                    'container': msg.missingAttribution()
                })
            require_unmanaged_attributions([attr], item.pk)
            if Inheritance.check_share_origin(
                serializer.validated_data['container'].pk,
                serializer.validated_data['attribute'].pk
            ):
                raise ValidationError({
                    'container': msg.deleteInheritedAttribution()
                })

            PropagationFacade().before_delete_attribution(item.pk, [attr])
            attr.delete()
            item.save(update_fields=['time_update'])

        return Response(
            status=c.HTTP_200_OK,
            data=s.RSFormParseSerializer(item).data
        )

    @extend_schema(
        summary='delete all Attributions for target constituenta',
        tags=['RSForm'],
        request=s.CstTargetSerializer,
        responses={
            c.HTTP_200_OK: s.RSFormParseSerializer,
            c.HTTP_400_BAD_REQUEST: None,
            c.HTTP_403_FORBIDDEN: None,
            c.HTTP_404_NOT_FOUND: None
        }
    )
    @action(detail=True, methods=['patch'], url_path='clear-attributions')
    @propagation_batch
    def clear_attributions(self, request: Request, pk) -> HttpResponse:
        ''' Endpoint: Delete Associations for target Constituenta. '''
        item = self._get_item()
        serializer = s.CstTargetSerializer(data=request.data, context={'schema': item})
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            # Lock the parent before constituent/attribution writes, matching publication.
            LibraryItem.objects.filter(pk=item.pk).update(time_update=F('time_update'))
            attributions = list(m.Attribution.objects.filter(container=serializer.validated_data['target']))
            require_unmanaged_attributions(attributions, item.pk)
            to_delete: list[m.Attribution] = []
            for attrib in attributions:
                if not Inheritance.check_share_origin(attrib.container.pk, attrib.attribute.pk):
                    to_delete.append(attrib)
            if to_delete:
                PropagationFacade().before_delete_attribution(item.pk, to_delete)
                m.Attribution.objects.filter(pk__in=[attrib.pk for attrib in to_delete]).delete()
                item.save(update_fields=['time_update'])

        return Response(
            status=c.HTTP_200_OK,
            data=s.RSFormParseSerializer(item).data
        )

    @extend_schema(
        summary='move constituenta',
        tags=['RSForm'],
        request=s.CstMoveSerializer,
        responses={
            c.HTTP_200_OK: s.RSFormParseSerializer,
            c.HTTP_400_BAD_REQUEST: None,
            c.HTTP_403_FORBIDDEN: None,
            c.HTTP_404_NOT_FOUND: None
        }
    )
    @action(detail=True, methods=['patch'], url_path='move-cst')
    def move_cst(self, request: Request, pk) -> HttpResponse:
        ''' Endpoint: Move multiple Constituents. '''
        item = self._get_item()
        serializer = s.CstMoveSerializer(data=request.data, context={'schema': item})
        serializer.is_valid(raise_exception=True)
        move_constituents(item, serializer.validated_data, request)

        return Response(
            status=c.HTTP_200_OK,
            data=s.RSFormParseSerializer(item).data
        )

    @extend_schema(
        summary='reset aliases, update expressions and references',
        tags=['RSForm'],
        request=None,
        responses={
            c.HTTP_200_OK: s.RSFormParseSerializer,
            c.HTTP_403_FORBIDDEN: None,
            c.HTTP_404_NOT_FOUND: None
        }
    )
    @action(detail=True, methods=['patch'], url_path='reset-aliases')
    @propagation_batch
    def reset_aliases(self, request: Request, pk) -> HttpResponse:
        ''' Endpoint: Recreate all aliases based on order. '''
        item = self._get_item()

        with transaction.atomic():
            # Lock the parent before constituent/attribution writes, matching publication.
            LibraryItem.objects.filter(pk=item.pk).update(time_update=F('time_update'))
            if Operation.objects.filter(result=item, operation_type=OperationType.RELATIVIZATION).exists():
                raise ValidationError('Edit managed aliases through the source schema or operation parameters.')
            schema = m.RSForm(item)
            schema.reset_aliases()
            mark_schema(item.pk)
            item.save(update_fields=['time_update'])

        return Response(
            status=c.HTTP_200_OK,
            data=s.RSFormParseSerializer(item).data
        )

    @extend_schema(
        summary='restore order based on types and term graph',
        tags=['RSForm'],
        request=None,
        responses={
            c.HTTP_200_OK: s.RSFormParseSerializer,
            c.HTTP_403_FORBIDDEN: None,
            c.HTTP_404_NOT_FOUND: None
        }
    )
    @action(detail=True, methods=['patch'], url_path='restore-order')
    @propagation_batch
    def restore_order(self, request: Request, pk) -> HttpResponse:
        ''' Endpoint: Restore order based on types and Term graph. '''
        item = self._get_item()

        with transaction.atomic():
            # Lock the parent before constituent/attribution writes, matching publication.
            LibraryItem.objects.filter(pk=item.pk).update(time_update=F('time_update'))
            m.OrderManager(m.RSFormCached(item.pk)).restore_order()
            mark_schema(item.pk)
            item.save(update_fields=['time_update'])

        return Response(
            status=c.HTTP_200_OK,
            data=s.RSFormParseSerializer(item).data
        )

    @extend_schema(
        summary='load data from TRS file',
        tags=['RSForm'],
        request=s.RSFormUploadSerializer,
        responses={
            c.HTTP_200_OK: s.RSFormParseSerializer,
            c.HTTP_400_BAD_REQUEST: None,
            c.HTTP_403_FORBIDDEN: None,
            c.HTTP_404_NOT_FOUND: None
        }
    )
    @action(detail=True, methods=['patch'], url_path='load-trs')
    @propagation_batch
    def load_trs(self, request: Request, pk) -> HttpResponse:
        ''' Endpoint: Load data from file and replace current schema. '''
        item = self._get_item()
        input_serializer = s.RSFormUploadSerializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)

        load_metadata = input_serializer.validated_data['load_metadata']
        uploaded_file = input_serializer.validated_data['file']
        try:
            data = utility.read_zipped_json(uploaded_file.file, utils.EXTEOR_INNER_FILENAME)
        except ZipMemberTooLarge:
            return Response(
                status=c.HTTP_400_BAD_REQUEST,
                data={'file': msg.importTooLarge()}
            )
        if data is None:
            return Response(
                status=c.HTTP_400_BAD_REQUEST,
                data={'file': msg.exteorFileCorrupted()}
            )
        data['id'] = item.pk
        if Inheritance.objects.filter(child__schema_id=item.pk).exists():
            raise ValidationError({
                'data': msg.importIntoInherited()
            })

        serializer = s.RSFormTRSSerializer(data=data, context={'load_meta': load_metadata})
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            # Lock the parent before constituent/attribution writes, matching publication.
            LibraryItem.objects.filter(pk=item.pk).update(time_update=F('time_update'))
            if Operation.objects.filter(result=item, operation_type=OperationType.RELATIVIZATION).exists():
                raise ValidationError('The schema is managed by relativization.')
            PropagationFacade().before_delete_schema(item.pk)
            result: m.RSFormCached = serializer.save()
            PropagationFacade().after_create_cst(list(result.constituentsQ().order_by('order')))

        return Response(
            status=c.HTTP_200_OK,
            data=s.RSFormParseSerializer(LibraryItem.objects.get(pk=result.pk)).data
        )

    @extend_schema(
        summary='get all constituents data from DB',
        tags=['RSForm'],
        request=None,
        responses={
            c.HTTP_200_OK: s.RSFormSerializer,
            c.HTTP_404_NOT_FOUND: None
        }
    )
    @action(detail=True, methods=['get'], url_path='contents')
    def contents(self, request: Request, pk) -> HttpResponse:
        ''' Endpoint: View schema db contents (including constituents). '''
        serializer = s.RSFormSerializer(self.get_object(), context={'request': request})
        return Response(
            status=c.HTTP_200_OK,
            data=serializer.data
        )

    @extend_schema(
        summary='get all constituents data and parses',
        tags=['RSForm'],
        request=None,
        responses={
            c.HTTP_200_OK: s.RSFormParseSerializer,
            c.HTTP_404_NOT_FOUND: None
        }
    )
    @action(detail=True, methods=['get'], url_path='details')
    def details(self, request: Request, pk) -> HttpResponse:
        ''' Endpoint: Detailed schema view including statuses and parse. '''
        serializer = s.RSFormParseSerializer(self.get_object(), context={'request': request})
        return Response(
            status=c.HTTP_200_OK,
            data=serializer.data
        )

    @extend_schema(
        summary='resolve text with references',
        tags=['RSForm', 'NaturalLanguage'],
        request=s.TextSerializer,
        responses={
            c.HTTP_200_OK: s.ResolverSerializer,
            c.HTTP_403_FORBIDDEN: None,
            c.HTTP_404_NOT_FOUND: None
        }
    )
    @action(detail=True, methods=['post'], url_path='resolve')
    def resolve(self, request: Request, pk) -> HttpResponse:
        ''' Endpoint: Resolve references in text against Schema terms context. '''
        item = self._get_item()
        serializer = s.TextSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        text = serializer.validated_data['text']
        resolver = m.RSForm.resolver_from_schema(item.pk)
        resolver.resolve(text)
        return Response(
            status=c.HTTP_200_OK,
            data=s.ResolverSerializer(resolver).data
        )


@extend_schema(
    summary='create an RSForm from supplied schema data',
    tags=['RSForm'],
    request=s.RSFormCreateFromDataSerializer,
    responses={
        c.HTTP_201_CREATED: LibraryItemSerializer,
        c.HTTP_400_BAD_REQUEST: None,
        c.HTTP_403_FORBIDDEN: None
    }
)
@api_view(['POST'])
@permission_classes([permissions.GlobalUser])
def create_rsform_from_data(request: Request) -> HttpResponse:
    ''' Create an RSForm from the supplied constituents and attributions. '''
    owner = cast(User, request.user) if not request.user.is_anonymous else None
    serializer = s.RSFormCreateFromDataSerializer(
        data=request.data,
        context={'owner': owner, 'request': request}
    )
    serializer.is_valid(raise_exception=True)
    schema = serializer.save()
    return Response(
        status=c.HTTP_201_CREATED,
        data=LibraryItemSerializer(LibraryItem.objects.get(pk=schema.pk)).data
    )


@extend_schema(
    summary='Inline synthesis: merge one schema into another',
    tags=['Operations'],
    request=s.InlineSynthesisSerializer,
    responses={c.HTTP_200_OK: s.RSFormParseSerializer}
)
@api_view(['PATCH'])
@permission_classes([permissions.GlobalUser])
@propagation_batch
def inline_synthesis(request: Request) -> HttpResponse:
    ''' Endpoint: Inline synthesis. '''
    serializer = s.InlineSynthesisSerializer(data=request.data, context={'user': request.user})
    serializer.is_valid(raise_exception=True)

    item = cast(LibraryItem, serializer.validated_data['receiver'])
    target_cst = cast(list[m.Constituenta], serializer.validated_data['items'])
    source = cast(LibraryItem, serializer.validated_data['source'])
    if not permissions.can_read_library_item(request.user, source):
        raise PermissionDenied()
    target_ids = [item.pk for item in target_cst] if target_cst else None

    with transaction.atomic():
        LibraryItem.objects.filter(pk=item.pk).update(time_update=F('time_update'))
        substitutions_data = serializer.validated_data['substitutions']
        require_unmanaged_constituents([
            row['original'].pk for row in substitutions_data if row['original'].schema_id == item.pk
        ], item.pk)
        propagation = PropagationFacade()
        receiver = propagation.get_schema(item.pk)
        new_items = receiver.insert_from(source.pk, target_ids)
        target_ids = [item[0].pk for item in new_items]
        mapping_ids = {cst.pk: new_cst for (cst, new_cst) in new_items}
        propagation.after_create_cst([item[1] for item in new_items])

        substitutions: list[tuple[m.Constituenta, m.Constituenta]] = []
        for substitution in substitutions_data:
            original = cast(m.Constituenta, substitution['original'])
            replacement = cast(m.Constituenta, substitution['substitution'])
            if original.pk in target_ids:
                original = mapping_ids[original.pk]
            else:
                replacement = mapping_ids[replacement.pk]
            substitutions.append((original, replacement))

        propagation.before_substitute(receiver.pk, substitutions)
        receiver.substitute(substitutions)
        receiver.resolve_all_text()
        item.save(update_fields=['time_update'])

    return Response(
        status=c.HTTP_200_OK,
        data=s.RSFormParseSerializer(item).data
    )
