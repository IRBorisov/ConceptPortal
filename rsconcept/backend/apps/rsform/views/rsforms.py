''' Endpoints for RSForm. '''
import json
from typing import Union, cast

import pyconcept
from django.db import transaction
from django.http import HttpResponse
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import generics
from rest_framework import status as c
from rest_framework import views, viewsets
from rest_framework.decorators import action, api_view
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.serializers import ValidationError

from apps.library.models import AccessPolicy, LibraryItem, LibraryItemType, LocationHead
from apps.library.serializers import LibraryItemSerializer
from apps.oss.models import PropagationFacade
from apps.users.models import User
from shared import messages as msg
from shared import permissions, utility

from .. import models as m
from .. import serializers as s
from .. import utils


@extend_schema(tags=['RSForm'])
@extend_schema_view()
class RSFormViewSet(viewsets.GenericViewSet, generics.ListAPIView, generics.RetrieveAPIView):
    ''' Endpoint: RSForm operations. '''
    queryset = LibraryItem.objects.filter(item_type=LibraryItemType.RSFORM)
    serializer_class = LibraryItemSerializer

    def _get_item(self) -> LibraryItem:
        return cast(LibraryItem, self.get_object())

    def get_permissions(self):
        ''' Determine permission class. '''
        if self.action in [
            'load_trs',
            'create_cst',
            'update_cst',
            'update_crucial',
            'move_cst',
            'delete_multiple_cst',
            'substitute',
            'restore_order',
            'reset_aliases',
            'produce_structure',
            'add_association',
            'delete_association',
            'clear_associations'
        ]:
            permission_list = [permissions.ItemEditor]
        elif self.action in [
            'contents',
            'details',
            'export_trs',
            'resolve',
            'check_expression',
            'check_constituenta'
        ]:
            permission_list = [permissions.ItemAnyone]
        else:
            permission_list = [permissions.Anyone]
        return [permission() for permission in permission_list]

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
        if 'insert_after' not in data:
            insert_after = None
        else:
            insert_after = data['insert_after']

        with transaction.atomic():
            schema = m.RSFormCached(item)
            new_cst = schema.create_cst(data, insert_after)
            PropagationFacade.after_create_cst(schema, [new_cst])
            item.save(update_fields=['time_update'])

        return Response(
            status=c.HTTP_201_CREATED,
            data={
                'new_cst': s.CstInfoSerializer(new_cst).data,
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

        with transaction.atomic():
            schema = m.RSFormCached(item)
            old_data = schema.update_cst(cst.pk, data)
            PropagationFacade.after_update_cst(schema, cst.pk, data, old_data)
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
                    PropagationFacade.after_change_cst_type(item.pk, cst.pk, cast(m.CstType, cst.cst_type))
                item.save(update_fields=['time_update'])
        return Response(
            status=c.HTTP_200_OK,
            data=s.RSFormParseSerializer(item).data
        )

    @extend_schema(
        summary='update crucial attributes of a given list of constituents',
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
    def update_crucial(self, request: Request, pk) -> HttpResponse:
        ''' Update crucial attributes of a given list of constituents. '''
        item = self._get_item()
        serializer = s.CrucialUpdateSerializer(data=request.data, partial=True, context={'schema': item})
        serializer.is_valid(raise_exception=True)
        value: bool = serializer.validated_data['value']

        with transaction.atomic():
            for cst in serializer.validated_data['target']:
                cst.crucial = value
                cst.save(update_fields=['crucial'])
            item.save(update_fields=['time_update'])

        return Response(
            status=c.HTTP_200_OK,
            data=s.RSFormParseSerializer(item).data
        )

    @extend_schema(
        summary='produce the structure of a given constituenta',
        tags=['RSForm'],
        request=s.CstTargetSerializer,
        responses={
            c.HTTP_200_OK: s.NewMultiCstResponse,
            c.HTTP_400_BAD_REQUEST: None,
            c.HTTP_403_FORBIDDEN: None,
            c.HTTP_404_NOT_FOUND: None
        }
    )
    @action(detail=True, methods=['patch'], url_path='produce-structure')
    def produce_structure(self, request: Request, pk) -> HttpResponse:
        ''' Produce a term for every element of the target constituenta typification. '''
        item = self._get_item()

        serializer = s.CstTargetSerializer(data=request.data, context={'schema': item})
        serializer.is_valid(raise_exception=True)
        cst = cast(m.Constituenta, serializer.validated_data['target'])
        if cst.cst_type not in [m.CstType.FUNCTION, m.CstType.STRUCTURED, m.CstType.TERM]:
            raise ValidationError({
                f'{cst.pk}': msg.constituentaNoStructure()
            })

        schema_details = s.RSFormParseSerializer(item).data['items']
        cst_parse = next(item for item in schema_details if item['id'] == cst.pk)['parse']
        if not cst_parse['typification']:
            return Response(
                status=c.HTTP_400_BAD_REQUEST,
                data={f'{cst.pk}': msg.constituentaNoStructure()}
            )

        with transaction.atomic():
            schema = m.RSFormCached(item)
            new_cst = schema.produce_structure(cst, cst_parse)
            PropagationFacade.after_create_cst(schema, new_cst)
            item.save(update_fields=['time_update'])
        return Response(
            status=c.HTTP_200_OK,
            data={
                'cst_list': [cst.pk for cst in new_cst],
                'schema': s.RSFormParseSerializer(item).data
            }
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
        substitutions: list[tuple[m.Constituenta, m.Constituenta]] = []

        with transaction.atomic():
            schema = m.RSForm(item)
            for substitution in serializer.validated_data['substitutions']:
                original = cast(m.Constituenta, substitution['original'])
                replacement = cast(m.Constituenta, substitution['substitution'])
                substitutions.append((original, replacement))
            PropagationFacade.before_substitute(item.pk, substitutions)
            schema.substitute(substitutions)
            item.save(update_fields=['time_update'])

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

        with transaction.atomic():
            schema = m.RSForm(item)
            PropagationFacade.before_delete_cst(item.pk, [cst.pk for cst in cst_list])
            schema.delete_cst(cst_list)
            item.save(update_fields=['time_update'])

        return Response(
            status=c.HTTP_200_OK,
            data=s.RSFormParseSerializer(item).data
        )

    @extend_schema(
        summary='create Association',
        tags=['Constituenta'],
        request=s.AssociationDataSerializer,
        responses={
            c.HTTP_201_CREATED: s.RSFormParseSerializer,
            c.HTTP_400_BAD_REQUEST: None,
            c.HTTP_403_FORBIDDEN: None,
            c.HTTP_404_NOT_FOUND: None
        }
    )
    @action(detail=True, methods=['post'], url_path='create-association')
    def create_association(self, request: Request, pk) -> HttpResponse:
        ''' Create Association. '''
        item = self._get_item()
        serializer = s.AssociationDataSerializer(data=request.data, context={'schema': item})
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            new_association = m.Association.objects.create(
                container=serializer.validated_data['container'],
                associate=serializer.validated_data['associate']
            )
            PropagationFacade.after_create_association(item.pk, [new_association])
            item.save(update_fields=['time_update'])

        return Response(
            status=c.HTTP_201_CREATED,
            data=s.RSFormParseSerializer(item).data
        )

    @extend_schema(
        summary='delete Association',
        tags=['RSForm'],
        request=s.AssociationDataSerializer,
        responses={
            c.HTTP_200_OK: s.RSFormParseSerializer,
            c.HTTP_400_BAD_REQUEST: None,
            c.HTTP_403_FORBIDDEN: None,
            c.HTTP_404_NOT_FOUND: None
        }
    )
    @action(detail=True, methods=['patch'], url_path='delete-association')
    def delete_association(self, request: Request, pk) -> HttpResponse:
        ''' Endpoint: Delete Association. '''
        item = self._get_item()
        serializer = s.AssociationDataSerializer(data=request.data, context={'schema': item})
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            target = list(m.Association.objects.filter(
                container=serializer.validated_data['container'],
                associate=serializer.validated_data['associate']
            ))
            if not target:
                raise ValidationError({
                    'container': msg.invalidAssociation()
                })

            PropagationFacade.before_delete_association(item.pk, target)
            m.Association.objects.filter(pk__in=[assoc.pk for assoc in target]).delete()
            item.save(update_fields=['time_update'])

        return Response(
            status=c.HTTP_200_OK,
            data=s.RSFormParseSerializer(item).data
        )

    @extend_schema(
        summary='delete all associations for target constituenta',
        tags=['RSForm'],
        request=s.CstTargetSerializer,
        responses={
            c.HTTP_200_OK: s.RSFormParseSerializer,
            c.HTTP_400_BAD_REQUEST: None,
            c.HTTP_403_FORBIDDEN: None,
            c.HTTP_404_NOT_FOUND: None
        }
    )
    @action(detail=True, methods=['patch'], url_path='clear-associations')
    def clear_associations(self, request: Request, pk) -> HttpResponse:
        ''' Endpoint: Delete Associations for target Constituenta. '''
        item = self._get_item()
        serializer = s.CstTargetSerializer(data=request.data, context={'schema': item})
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            target = list(m.Association.objects.filter(container=serializer.validated_data['target']))
            if target:
                PropagationFacade.before_delete_association(item.pk, target)
                m.Association.objects.filter(pk__in=[assoc.pk for assoc in target]).delete()
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

        with transaction.atomic():
            schema = m.RSForm(item)
            schema.move_cst(
                target=serializer.validated_data['items'],
                destination=serializer.validated_data['move_to']
            )
            item.save(update_fields=['time_update'])

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
    def reset_aliases(self, request: Request, pk) -> HttpResponse:
        ''' Endpoint: Recreate all aliases based on order. '''
        item = self._get_item()

        with transaction.atomic():
            schema = m.RSForm(item)
            schema.reset_aliases()
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
    def restore_order(self, request: Request, pk) -> HttpResponse:
        ''' Endpoint: Restore order based on types and Term graph. '''
        item = self._get_item()

        with transaction.atomic():
            m.OrderManager(m.RSFormCached(item)).restore_order()
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
    def load_trs(self, request: Request, pk) -> HttpResponse:
        ''' Endpoint: Load data from file and replace current schema. '''
        input_serializer = s.RSFormUploadSerializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)

        item = self._get_item()
        load_metadata = input_serializer.validated_data['load_metadata']
        data = utility.read_zipped_json(request.FILES['file'].file, utils.EXTEOR_INNER_FILENAME)
        if data is None:
            return Response(
                status=c.HTTP_400_BAD_REQUEST,
                data={'file': msg.exteorFileCorrupted()}
            )
        data['id'] = item.pk

        serializer = s.RSFormTRSSerializer(data=data, context={'load_meta': load_metadata})
        serializer.is_valid(raise_exception=True)
        result: m.RSForm = serializer.save()
        return Response(
            status=c.HTTP_200_OK,
            data=s.RSFormParseSerializer(result.model).data
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
        serializer = s.RSFormSerializer(self.get_object())
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
        serializer = s.RSFormParseSerializer(self.get_object())
        return Response(
            status=c.HTTP_200_OK,
            data=serializer.data
        )

    @extend_schema(
        summary='check RSLang expression',
        tags=['RSForm', 'FormalLanguage'],
        request=s.ExpressionSerializer,
        responses={
            c.HTTP_200_OK: s.ExpressionParseSerializer,
            c.HTTP_404_NOT_FOUND: None
        },
    )
    @action(detail=True, methods=['post'], url_path='check-expression')
    def check_expression(self, request: Request, pk) -> HttpResponse:
        ''' Endpoint: Check RSLang expression against schema context. '''
        serializer = s.ExpressionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        expression = serializer.validated_data['expression']
        pySchema = s.PyConceptAdapter(pk)
        result = pyconcept.check_expression(json.dumps(pySchema.data), expression)
        return Response(
            status=c.HTTP_200_OK,
            data=json.loads(result)
        )

    @extend_schema(
        summary='check expression for specific CstType',
        tags=['RSForm', 'FormalLanguage'],
        request=s.ConstituentaCheckSerializer,
        responses={
            c.HTTP_200_OK: s.ExpressionParseSerializer,
            c.HTTP_404_NOT_FOUND: None
        },
    )
    @action(detail=True, methods=['post'], url_path='check-constituenta')
    def check_constituenta(self, request: Request, pk) -> HttpResponse:
        ''' Endpoint: Check RSLang expression against Schema context. '''
        serializer = s.ConstituentaCheckSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        expression = serializer.validated_data['definition_formal']
        alias = serializer.validated_data['alias']
        cst_type = cast(m.CstType, serializer.validated_data['cst_type'])

        pySchema = s.PyConceptAdapter(pk)
        result = pyconcept.check_constituenta(json.dumps(pySchema.data), alias, expression, cst_type)
        return Response(
            status=c.HTTP_200_OK,
            data=json.loads(result)
        )

    @extend_schema(
        summary='resolve text with references',
        tags=['RSForm', 'NaturalLanguage'],
        request=s.TextSerializer,
        responses={
            c.HTTP_200_OK: s.ResolverSerializer,
            c.HTTP_404_NOT_FOUND: None
        }
    )
    @action(detail=True, methods=['post'], url_path='resolve')
    def resolve(self, request: Request, pk) -> HttpResponse:
        ''' Endpoint: Resolve references in text against Schema terms context. '''
        serializer = s.TextSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        text = serializer.validated_data['text']
        resolver = m.RSForm.resolver_from_schema(pk)
        resolver.resolve(text)
        return Response(
            status=c.HTTP_200_OK,
            data=s.ResolverSerializer(resolver).data
        )

    @extend_schema(
        summary='export as TRS file',
        tags=['RSForm'],
        request=None,
        responses={
            (c.HTTP_200_OK, 'application/zip'): bytes,
            c.HTTP_404_NOT_FOUND: None
        }
    )
    @action(detail=True, methods=['get'], url_path='export-trs')
    def export_trs(self, request: Request, pk) -> HttpResponse:
        ''' Endpoint: Download Exteor compatible file. '''
        model = self._get_item()
        data = s.generate_trs(model)
        file = utility.write_zipped_json(data, utils.EXTEOR_INNER_FILENAME)
        filename = utils.filename_for_schema(model.alias)
        response = HttpResponse(file, content_type='application/zip')
        response['Content-Disposition'] = f'attachment; filename={filename}'
        return response


class TrsImportView(views.APIView):
    ''' Endpoint: Upload RS form in Exteor format. '''
    serializer_class = s.FileSerializer
    permission_classes = [permissions.GlobalUser]

    @extend_schema(
        summary='import TRS file into RSForm',
        tags=['RSForm'],
        request=s.FileSerializer,
        responses={
            c.HTTP_201_CREATED: LibraryItemSerializer,
            c.HTTP_400_BAD_REQUEST: None,
            c.HTTP_403_FORBIDDEN: None
        }
    )
    def post(self, request: Request) -> HttpResponse:
        data = utility.read_zipped_json(request.FILES['file'].file, utils.EXTEOR_INNER_FILENAME)
        if data is None:
            return Response(
                status=c.HTTP_400_BAD_REQUEST,
                data={'file': msg.exteorFileCorrupted()}
            )
        owner = cast(User, self.request.user)
        _prepare_rsform_data(data, request, owner)
        serializer = s.RSFormTRSSerializer(data=data, context={'load_meta': True})
        serializer.is_valid(raise_exception=True)
        schema: m.RSForm = serializer.save()
        return Response(
            status=c.HTTP_201_CREATED,
            data=LibraryItemSerializer(schema.model).data
        )


@extend_schema(
    summary='create RSForm empty or from file',
    tags=['RSForm'],
    request=LibraryItemSerializer,
    responses={
        c.HTTP_201_CREATED: LibraryItemSerializer,
        c.HTTP_400_BAD_REQUEST: None,
        c.HTTP_403_FORBIDDEN: None
    }
)
@api_view(['POST'])
def create_rsform(request: Request) -> HttpResponse:
    ''' Endpoint: Create RSForm from user input and/or trs file. '''
    owner = cast(User, request.user) if not request.user.is_anonymous else None
    if 'file' not in request.FILES:
        return Response(
            status=c.HTTP_400_BAD_REQUEST,
            data={'file': msg.missingFile()}
        )

    data = utility.read_zipped_json(request.FILES['file'].file, utils.EXTEOR_INNER_FILENAME)
    if data is None:
        return Response(
            status=c.HTTP_400_BAD_REQUEST,
            data={'file': msg.exteorFileCorrupted()}
        )
    _prepare_rsform_data(data, request, owner)
    serializer_rsform = s.RSFormTRSSerializer(data=data, context={'load_meta': True})
    serializer_rsform.is_valid(raise_exception=True)
    schema: m.RSForm = serializer_rsform.save()
    return Response(
        status=c.HTTP_201_CREATED,
        data=LibraryItemSerializer(schema.model).data
    )


def _prepare_rsform_data(data: dict, request: Request, owner: Union[User, None]):
    data['owner'] = owner
    if 'title' in request.data and request.data['title'] != '':
        data['title'] = request.data['title']
    if data['title'] == '':
        data['title'] = 'Без названия ' + request.FILES['file'].fileName
    if 'alias' in request.data and request.data['alias'] != '':
        data['alias'] = request.data['alias']
    if 'description' in request.data and request.data['description'] != '':
        data['description'] = request.data['description']

    visible = True
    if 'visible' in request.data:
        visible = request.data['visible'] == 'true'
    data['visible'] = visible

    read_only = False
    if 'read_only' in request.data:
        read_only = request.data['read_only'] == 'true'
    data['read_only'] = read_only

    data['access_policy'] = request.data.get('access_policy', AccessPolicy.PUBLIC)
    data['location'] = request.data.get('location', LocationHead.USER)


@extend_schema(
    summary='Inline synthesis: merge one schema into another',
    tags=['Operations'],
    request=s.InlineSynthesisSerializer,
    responses={c.HTTP_200_OK: s.RSFormParseSerializer}
)
@api_view(['PATCH'])
def inline_synthesis(request: Request) -> HttpResponse:
    ''' Endpoint: Inline synthesis. '''
    serializer = s.InlineSynthesisSerializer(data=request.data, context={'user': request.user})
    serializer.is_valid(raise_exception=True)

    receiver = m.RSFormCached(serializer.validated_data['receiver'])
    items = cast(list[m.Constituenta], serializer.validated_data['items'])
    if not items:
        source = cast(LibraryItem, serializer.validated_data['source'])
        items = list(m.Constituenta.objects.filter(schema=source).order_by('order'))

    with transaction.atomic():
        new_items = receiver.insert_copy(items)
        PropagationFacade.after_create_cst(receiver, new_items)

        substitutions: list[tuple[m.Constituenta, m.Constituenta]] = []
        for substitution in serializer.validated_data['substitutions']:
            original = cast(m.Constituenta, substitution['original'])
            replacement = cast(m.Constituenta, substitution['substitution'])
            if original in items:
                index = next(i for (i, cst) in enumerate(items) if cst.pk == original.pk)
                original = new_items[index]
            else:
                index = next(i for (i, cst) in enumerate(items) if cst.pk == replacement.pk)
                replacement = new_items[index]
            substitutions.append((original, replacement))

        PropagationFacade.before_substitute(receiver.model.pk, substitutions)
        receiver.substitute(substitutions)
        receiver.model.save(update_fields=['time_update'])

    return Response(
        status=c.HTTP_200_OK,
        data=s.RSFormParseSerializer(receiver.model).data
    )
