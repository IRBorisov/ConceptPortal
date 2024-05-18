''' Endpoints for RSForm. '''
import json
from typing import cast, Union
from django.db import transaction
from django.http import HttpResponse
from rest_framework import views, viewsets, generics, permissions
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.request import Request
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import status as c

import pyconcept

from .. import models as m
from .. import serializers as s
from .. import utils
from .. import messages as msg


@extend_schema(tags=['RSForm'])
@extend_schema_view()
class RSFormViewSet(viewsets.GenericViewSet, generics.ListAPIView, generics.RetrieveAPIView):
    ''' Endpoint: RSForm operations. '''
    queryset = m.LibraryItem.objects.filter(item_type=m.LibraryItemType.RSFORM)
    serializer_class = s.LibraryItemSerializer

    def _get_schema(self) -> m.RSForm:
        return m.RSForm(cast(m.LibraryItem, self.get_object()))

    def get_permissions(self):
        ''' Determine permission class. '''
        if self.action in ['load_trs', 'cst_create', 'cst_delete_multiple',
                           'reset_aliases', 'cst_rename', 'cst_substitute']:
            permission_list = [utils.ObjectOwnerOrAdmin]
        else:
            permission_list = [permissions.AllowAny]
        return [permission() for permission in permission_list]

    @extend_schema(
        summary='create constituenta',
        tags=['Constituenta'],
        request=s.CstCreateSerializer,
        responses={
            c.HTTP_201_CREATED: s.NewCstResponse,
            c.HTTP_403_FORBIDDEN: None,
            c.HTTP_404_NOT_FOUND: None
        }
    )
    @action(detail=True, methods=['post'], url_path='cst-create')
    def cst_create(self, request: Request, pk):
        ''' Create new constituenta. '''
        schema = self._get_schema()
        serializer = s.CstCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        new_cst = schema.create_cst(
            data=data,
            insert_after=data['insert_after'] if 'insert_after' in data else None
        )
        schema.item.refresh_from_db()
        response = Response(
            status=c.HTTP_201_CREATED,
            data={
                'new_cst': s.CstSerializer(new_cst).data,
                'schema': s.RSFormParseSerializer(schema.item).data
            }
        )
        response['Location'] = new_cst.get_absolute_url()
        return response

    @extend_schema(
        summary='produce the structure of a given constituenta',
        tags=['RSForm'],
        request=s.CstTargetSerializer,
        responses={
            c.HTTP_200_OK: s.NewMultiCstResponse,
            c.HTTP_403_FORBIDDEN: None,
            c.HTTP_404_NOT_FOUND: None
        }
    )
    @action(detail=True, methods=['patch'], url_path='cst-produce-structure')
    def produce_structure(self, request: Request, pk):
        ''' Produce a term for every element of the target constituenta typification. '''
        schema = self._get_schema()

        serializer = s.CstTargetSerializer(data=request.data, context={'schema': schema.item})
        serializer.is_valid(raise_exception=True)
        cst = cast(m.Constituenta, serializer.validated_data['target'])

        schema_details = s.RSFormParseSerializer(schema.item).data['items']
        cst_parse = next(item for item in schema_details if item['id']==cst.id)['parse']
        if not cst_parse['typification']:
            return Response(
            status=c.HTTP_400_BAD_REQUEST,
            data={f'{cst.id}': msg.constituentaNoStructure()}
        )

        result = schema.produce_structure(cst, cst_parse)
        return Response(
            status=c.HTTP_200_OK,
            data={
                'cst_list': result,
                'schema': s.RSFormParseSerializer(schema.item).data
            }
        )

    @extend_schema(
        summary='rename constituenta',
        tags=['Constituenta'],
        request=s.CstRenameSerializer,
        responses={
            c.HTTP_200_OK: s.NewCstResponse,
            c.HTTP_403_FORBIDDEN: None,
            c.HTTP_404_NOT_FOUND: None
        }
    )
    @transaction.atomic
    @action(detail=True, methods=['patch'], url_path='cst-rename')
    def cst_rename(self, request: Request, pk):
        ''' Rename constituenta possibly changing type. '''
        schema = self._get_schema()
        serializer = s.CstRenameSerializer(data=request.data, context={'schema': schema.item})
        serializer.is_valid(raise_exception=True)

        cst = cast(m.Constituenta, serializer.validated_data['target'])
        old_alias = cst.alias

        cst.alias = serializer.validated_data['alias']
        cst.cst_type = serializer.validated_data['cst_type']
        cst.save()

        mapping = { old_alias: cst.alias }
        schema.apply_mapping(mapping, change_aliases=False)
        schema.item.refresh_from_db()
        cst.refresh_from_db()

        return Response(
            status=c.HTTP_200_OK,
            data={
                'new_cst': s.CstSerializer(cst).data,
                'schema': s.RSFormParseSerializer(schema.item).data
            }
        )

    @extend_schema(
        summary='substitute constituenta',
        tags=['RSForm'],
        request=s.CstSubstituteSerializer,
        responses={
            c.HTTP_200_OK: s.RSFormParseSerializer,
            c.HTTP_403_FORBIDDEN: None,
            c.HTTP_404_NOT_FOUND: None
        }
    )
    @transaction.atomic
    @action(detail=True, methods=['patch'], url_path='cst-substitute')
    def cst_substitute(self, request: Request, pk):
        ''' Substitute occurrences of constituenta with another one. '''
        schema = self._get_schema()
        serializer = s.CstSubstituteSerializer(
            data=request.data,
            context={'schema': schema.item}
        )
        serializer.is_valid(raise_exception=True)
        for substitution in serializer.validated_data['substitutions']:
            original = cast(m.Constituenta, substitution['original'])
            replacement = cast(m.Constituenta, substitution['substitution'])
            schema.substitute(original, replacement, substitution['transfer_term'])
        schema.item.refresh_from_db()
        return Response(
            status=c.HTTP_200_OK,
            data=s.RSFormParseSerializer(schema.item).data
        )

    @extend_schema(
        summary='delete constituents',
        tags=['RSForm'],
        request=s.CstListSerializer,
        responses={
            c.HTTP_200_OK: s.RSFormParseSerializer,
            c.HTTP_403_FORBIDDEN: None,
            c.HTTP_404_NOT_FOUND: None
        }
    )
    @action(detail=True, methods=['patch'], url_path='cst-delete-multiple')
    def cst_delete_multiple(self, request: Request, pk):
        ''' Endpoint: Delete multiple constituents. '''
        schema = self._get_schema()
        serializer = s.CstListSerializer(
            data=request.data,
            context={'schema': schema.item}
        )
        serializer.is_valid(raise_exception=True)
        schema.delete_cst(serializer.validated_data['items'])
        schema.item.refresh_from_db()
        return Response(
            status=c.HTTP_200_OK,
            data=s.RSFormParseSerializer(schema.item).data
        )

    @extend_schema(
        summary='move constituenta',
        tags=['RSForm'],
        request=s.CstMoveSerializer,
        responses={
            c.HTTP_200_OK: s.RSFormParseSerializer,
            c.HTTP_403_FORBIDDEN: None,
            c.HTTP_404_NOT_FOUND: None
        }
    )
    @action(detail=True, methods=['patch'], url_path='cst-moveto')
    def cst_moveto(self, request: Request, pk):
        ''' Endpoint: Move multiple constituents. '''
        schema = self._get_schema()
        serializer = s.CstMoveSerializer(
            data=request.data,
            context={'schema': schema.item}
        )
        serializer.is_valid(raise_exception=True)
        schema.move_cst(
            listCst=serializer.validated_data['items'],
            target=serializer.validated_data['move_to']
        )
        return Response(
            status=c.HTTP_200_OK,
            data=s.RSFormParseSerializer(schema.item).data
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
    def reset_aliases(self, request: Request, pk):
        ''' Endpoint: Recreate all aliases based on order. '''
        schema = self._get_schema()
        schema.reset_aliases()
        return Response(
            status=c.HTTP_200_OK,
            data=s.RSFormParseSerializer(schema.item).data
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
    def restore_order(self, request: Request, pk):
        ''' Endpoint: Restore order based on types and term graph. '''
        schema = self._get_schema()
        schema.restore_order()
        return Response(
            status=c.HTTP_200_OK,
            data=s.RSFormParseSerializer(schema.item).data
        )

    @extend_schema(
        summary='load data from TRS file',
        tags=['RSForm'],
        request=s.RSFormUploadSerializer,
        responses={
            c.HTTP_200_OK: s.RSFormParseSerializer,
            c.HTTP_403_FORBIDDEN: None,
            c.HTTP_404_NOT_FOUND: None
        }
    )
    @action(detail=True, methods=['patch'], url_path='load-trs')
    def load_trs(self, request: Request, pk):
        ''' Endpoint: Load data from file and replace current schema. '''
        input_serializer = s.RSFormUploadSerializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)
        schema = self._get_schema()
        load_metadata = input_serializer.validated_data['load_metadata']
        data = utils.read_zipped_json(request.FILES['file'].file, utils.EXTEOR_INNER_FILENAME)
        data['id'] = schema.item.pk

        serializer = s.RSFormTRSSerializer(
            data=data,
            context={'load_meta': load_metadata}
        )
        serializer.is_valid(raise_exception=True)
        result = serializer.save()
        return Response(
            status=c.HTTP_200_OK,
            data=s.RSFormParseSerializer(result.item).data
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
    @action(detail=True, methods=['get'])
    def contents(self, request: Request, pk):
        ''' Endpoint: View schema db contents (including constituents). '''
        schema = s.RSFormSerializer(self.get_object())
        return Response(
            status=c.HTTP_200_OK,
            data=schema.data
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
    @action(detail=True, methods=['get'])
    def details(self, request: Request, pk):
        ''' Endpoint: Detailed schema view including statuses and parse. '''
        serializer = s.RSFormParseSerializer(cast(m.LibraryItem, self.get_object()))
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
    @action(detail=True, methods=['post'])
    def check(self, request: Request, pk):
        ''' Endpoint: Check RSLang expression against schema context. '''
        serializer = s.ExpressionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        expression = serializer.validated_data['expression']
        schema =  s.PyConceptAdapter(self._get_schema())
        result = pyconcept.check_expression(json.dumps(schema.data), expression)
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
    @action(detail=True, methods=['post'])
    def resolve(self, request: Request, pk):
        ''' Endpoint: Resolve references in text against schema terms context. '''
        serializer = s.TextSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        text = serializer.validated_data['text']
        resolver = self._get_schema().resolver()
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
    def export_trs(self, request: Request, pk):
        ''' Endpoint: Download Exteor compatible file. '''
        data = s.RSFormTRSSerializer(self._get_schema()).data
        file = utils.write_zipped_json(data, utils.EXTEOR_INNER_FILENAME)
        filename = utils.filename_for_schema(self._get_schema().item.alias)
        response = HttpResponse(file, content_type='application/zip')
        response['Content-Disposition'] = f'attachment; filename={filename}'
        return response


class TrsImportView(views.APIView):
    ''' Endpoint: Upload RS form in Exteor format. '''
    serializer_class = s.FileSerializer
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary='import TRS file into RSForm',
        tags=['RSForm'],
        request=s.FileSerializer,
        responses={
            c.HTTP_201_CREATED: s.LibraryItemSerializer,
            c.HTTP_403_FORBIDDEN: None
        }
    )
    def post(self, request: Request):
        data = utils.read_zipped_json(request.FILES['file'].file, utils.EXTEOR_INNER_FILENAME)
        owner = cast(m.User, self.request.user)
        _prepare_rsform_data(data, request, owner)
        serializer = s.RSFormTRSSerializer(
            data=data,
            context={'load_meta': True}
        )
        serializer.is_valid(raise_exception=True)
        schema = serializer.save()
        result = s.LibraryItemSerializer(schema.item)
        return Response(
            status=c.HTTP_201_CREATED,
            data=result.data
        )


@extend_schema(
    summary='create new RSForm empty or from file',
    tags=['RSForm'],
    request=s.LibraryItemSerializer,
    responses={
        c.HTTP_201_CREATED: s.LibraryItemSerializer,
        c.HTTP_403_FORBIDDEN: None
    }
)
@api_view(['POST'])
def create_rsform(request: Request):
    ''' Endpoint: Create RSForm from user input and/or trs file. '''
    owner = cast(m.User, request.user) if not request.user.is_anonymous else None
    if 'file' not in request.FILES:
        serializer = s.LibraryItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        schema = m.RSForm.create(
            title=serializer.validated_data['title'],
            owner=owner,
            alias=serializer.validated_data.get('alias', ''),
            comment=serializer.validated_data.get('comment', ''),
            is_common=serializer.validated_data.get('is_common', False),
            is_canonical=serializer.validated_data.get('is_canonical', False),
        )
    else:
        data = utils.read_zipped_json(request.FILES['file'].file, utils.EXTEOR_INNER_FILENAME)
        _prepare_rsform_data(data, request, owner)
        serializer_rsform = s.RSFormTRSSerializer(data=data, context={'load_meta': True})
        serializer_rsform.is_valid(raise_exception=True)
        schema = serializer_rsform.save()
    result = s.LibraryItemSerializer(schema.item)
    return Response(
        status=c.HTTP_201_CREATED,
        data=result.data
    )


def _prepare_rsform_data(data: dict, request: Request, owner: Union[m.User, None]):
    data['owner'] = owner
    if 'title' in request.data and request.data['title'] != '':
        data['title'] = request.data['title']
    if data['title'] == '':
        data['title'] = 'Без названия ' + request.FILES['file'].fileName
    if 'alias' in request.data and request.data['alias'] != '':
        data['alias'] = request.data['alias']
    if 'comment' in request.data and request.data['comment'] != '':
        data['comment'] = request.data['comment']

    is_common = True
    if 'is_common' in request.data:
        is_common = request.data['is_common'] == 'true'
    data['is_common'] = is_common

    is_canonical = False
    if 'is_canonical' in request.data:
        is_canonical = request.data['is_canonical'] == 'true'
    data['is_canonical'] = is_canonical
