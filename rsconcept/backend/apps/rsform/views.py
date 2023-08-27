''' REST API: RSForms for conceptual schemas. '''
import json
from typing import cast
from django.db import transaction
from django.http import HttpResponse
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from rest_framework import views, viewsets, filters, generics, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.decorators import api_view

import pyconcept
from . import models as m
from . import serializers as s
from . import utils


class LibraryActiveView(generics.ListAPIView):
    ''' Endpoint: Get list of rsforms available for active user. '''
    permission_classes = (permissions.AllowAny,)
    serializer_class = s.LibraryItemSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_anonymous:
            # pylint: disable=unsupported-binary-operation
            return m.LibraryItem.objects.filter(Q(is_common=True) | Q(owner=user) | Q(subscription__user=user))
        else:
            return m.LibraryItem.objects.filter(is_common=True)


class ConstituentAPIView(generics.RetrieveUpdateAPIView):
    ''' Endpoint: Get / Update Constituenta. '''
    queryset = m.Constituenta.objects.all()
    serializer_class = s.ConstituentaSerializer

    def get_permissions(self):
        result = super().get_permissions()
        if self.request.method.lower() == 'get':
            result.append(permissions.AllowAny())
        else:
            result.append(utils.SchemaOwnerOrAdmin())
        return result

# pylint: disable=too-many-ancestors
class LibraryViewSet(viewsets.ModelViewSet):
    ''' Endpoint: Library operations. '''
    queryset = m.LibraryItem.objects.all()
    serializer_class = s.LibraryItemSerializer

    filter_backends = (DjangoFilterBackend, filters.OrderingFilter)
    filterset_fields = ['item_type', 'owner', 'is_common', 'is_canonical']
    ordering_fields = ('item_type', 'owner', 'title', 'time_update')
    ordering = '-time_update'

    def perform_create(self, serializer):
        if not self.request.user.is_anonymous and 'owner' not in self.request.POST:
            return serializer.save(owner=self.request.user)
        else:
            return serializer.save()

    def get_permissions(self):
        if self.action in ['update', 'destroy', 'partial_update']:
            permission_classes = [utils.ObjectOwnerOrAdmin]
        elif self.action in ['create', 'clone', 'subscribe', 'unsubscribe']:
            permission_classes = [permissions.IsAuthenticated]
        elif self.action in ['claim']:
            permission_classes = [utils.IsClaimable]
        else:
            permission_classes = [permissions.AllowAny]
        return [permission() for permission in permission_classes]

    def _get_item(self) -> m.LibraryItem:
        return cast(m.LibraryItem, self.get_object())

    @transaction.atomic
    @action(detail=True, methods=['post'], url_path='clone')
    def clone(self, request, pk):
        ''' Endpoint: Create deep copy of library item. '''
        serializer = s.LibraryItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        item = self._get_item()
        if item.item_type == m.LibraryItemType.RSFORM:
            schema = m.RSForm(item)
            clone_data = s.RSFormTRSSerializer(schema).data
            clone_data['item_type'] = item.item_type
            clone_data['owner'] = self.request.user
            clone_data['title'] = serializer.validated_data['title']
            clone_data['alias'] = serializer.validated_data.get('alias', '')
            clone_data['comment'] = serializer.validated_data.get('comment', '')
            clone_data['is_common'] = serializer.validated_data.get('is_common', False)
            clone_data['is_canonical'] = serializer.validated_data.get('is_canonical', False)
            clone = s.RSFormTRSSerializer(data=clone_data, context={'load_meta': True})
            clone.is_valid(raise_exception=True)
            new_schema = clone.save()
            return Response(status=201, data=m.PyConceptAdapter(new_schema).full())
        return Response(status=404)

    @transaction.atomic
    @action(detail=True, methods=['post'])
    def claim(self, request, pk=None):
        ''' Endpoint: Claim ownership of LibraryItem. '''
        item = self._get_item()
        if item.owner == self.request.user:
            return Response(status=304)
        else:
            item.owner = self.request.user
            item.save()
            m.Subscription.subscribe(user=item.owner, item=item)
            return Response(status=200, data=s.LibraryItemSerializer(item).data)

    @action(detail=True, methods=['post'])
    def subscribe(self, request, pk):
        ''' Endpoint: Subscribe current user to item. '''
        item = self._get_item()
        m.Subscription.subscribe(user=self.request.user, item=item)
        return Response(status=200)

    @action(detail=True, methods=['delete'])
    def unsubscribe(self, request, pk):
        ''' Endpoint: Unsubscribe current user from item. '''
        item = self._get_item()
        m.Subscription.unsubscribe(user=self.request.user, item=item)
        return Response(status=200)


class RSFormViewSet(viewsets.GenericViewSet, generics.ListAPIView, generics.RetrieveAPIView):
    ''' Endpoint: RSForm operations. '''
    queryset = m.LibraryItem.objects.filter(item_type=m.LibraryItemType.RSFORM)
    serializer_class = s.LibraryItemSerializer

    def _get_schema(self) -> m.RSForm:
        return m.RSForm(self.get_object()) # type: ignore

    def get_permissions(self):
        ''' Determine permission class. '''
        if self.action in ['load_trs', 'cst_create', 'cst_multidelete',
                           'reset_aliases', 'cst_rename']:
            permission_classes = [utils.ObjectOwnerOrAdmin]
        else:
            permission_classes = [permissions.AllowAny]
        return [permission() for permission in permission_classes]

    @action(detail=True, methods=['post'], url_path='cst-create')
    def cst_create(self, request, pk):
        ''' Create new constituenta. '''
        schema = self._get_schema()
        serializer = s.CstCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        new_cst = schema.create_cst(data, data['insert_after'] if 'insert_after' in data else None)
        schema.item.refresh_from_db()
        response = Response(status=201, data={
            'new_cst': s.ConstituentaSerializer(new_cst).data,
            'schema': m.PyConceptAdapter(schema).full()
        })
        response['Location'] = new_cst.get_absolute_url()
        return response

    @transaction.atomic
    @action(detail=True, methods=['patch'], url_path='cst-rename')
    def cst_rename(self, request, pk):
        ''' Rename constituenta possibly changing type. '''
        schema = self._get_schema()
        serializer = s.CstRenameSerializer(data=request.data, context={'schema': schema})
        serializer.is_valid(raise_exception=True)
        old_alias = m.Constituenta.objects.get(pk=request.data['id']).alias
        serializer.save()
        mapping = { old_alias: serializer.validated_data['alias'] }
        schema.apply_mapping(mapping, change_aliases=False)
        schema.update_order()
        schema.item.refresh_from_db()
        cst = m.Constituenta.objects.get(pk=serializer.validated_data['id'])
        return Response(status=200, data={
            'new_cst': s.ConstituentaSerializer(cst).data,
            'schema': m.PyConceptAdapter(schema).full()
        })

    @action(detail=True, methods=['patch'], url_path='cst-multidelete')
    def cst_multidelete(self, request, pk):
        ''' Endpoint: Delete multiple constituents. '''
        schema = self._get_schema()
        serializer = s.CstListSerializer(data=request.data, context={'schema': schema})
        serializer.is_valid(raise_exception=True)
        schema.delete_cst(serializer.validated_data['constituents'])
        schema.item.refresh_from_db()
        return Response(status=202, data=m.PyConceptAdapter(schema).full())

    @action(detail=True, methods=['patch'], url_path='cst-moveto')
    def cst_moveto(self, request, pk):
        ''' Endpoint: Move multiple constituents. '''
        schema = self._get_schema()
        serializer = s.CstMoveSerializer(data=request.data, context={'schema': schema})
        serializer.is_valid(raise_exception=True)
        schema.move_cst(serializer.validated_data['constituents'], serializer.validated_data['move_to'])
        schema.item.refresh_from_db()
        return Response(status=200, data=m.PyConceptAdapter(schema).full())

    @action(detail=True, methods=['patch'], url_path='reset-aliases')
    def reset_aliases(self, request, pk):
        ''' Endpoint: Recreate all aliases based on order. '''
        schema = self._get_schema()
        schema.reset_aliases()
        return Response(status=200, data=m.PyConceptAdapter(schema).full())

    @action(detail=True, methods=['patch'], url_path='load-trs')
    def load_trs(self, request, pk):
        ''' Endpoint: Load data from file and replace current schema. '''
        serializer = s.RSFormUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        schema = self._get_schema()
        load_metadata = serializer.validated_data['load_metadata']
        data = utils.read_trs(request.FILES['file'].file)
        data['id'] = schema.item.pk

        serializer = s.RSFormTRSSerializer(data=data, context={'load_meta': load_metadata})
        serializer.is_valid(raise_exception=True)
        schema = serializer.save()
        return Response(status=200, data=m.PyConceptAdapter(schema).full())

    @action(detail=True, methods=['get'])
    def contents(self, request, pk):
        ''' Endpoint: View schema db contents (including constituents). '''
        schema = s.RSFormSerializer(self._get_schema()).data
        return Response(schema)

    @action(detail=True, methods=['get'])
    def details(self, request, pk):
        ''' Endpoint: Detailed schema view including statuses and parse. '''
        schema = self._get_schema()
        serializer = m.PyConceptAdapter(schema)
        return Response(serializer.full())

    @action(detail=True, methods=['post'])
    def check(self, request, pk):
        ''' Endpoint: Check RSLang expression against schema context. '''
        schema =  m.PyConceptAdapter(self._get_schema())
        serializer = s.ExpressionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        expression = serializer.validated_data['expression']
        result = pyconcept.check_expression(json.dumps(schema.data), expression)
        return Response(json.loads(result))

    @action(detail=True, methods=['post'])
    def resolve(self, request, pk):
        ''' Endpoint: Resolve refenrces in text against schema terms context. '''
        schema = self._get_schema()
        serializer = s.TextSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        text = serializer.validated_data['text']
        resolver = schema.resolver()
        resolver.resolve(text)
        return Response(status=200, data=s.ResolverSerializer(resolver).data)

    @action(detail=True, methods=['get'], url_path='export-trs')
    def export_trs(self, request, pk):
        ''' Endpoint: Download Exteor compatible file. '''
        schema = s.RSFormTRSSerializer(self._get_schema()).data
        trs = utils.write_trs(schema)
        filename = self._get_schema().item.alias
        if filename == '' or not filename.isascii():
            # Note: non-ascii symbols in Content-Disposition
            # are not supported by some browsers
            filename = 'Schema'
        filename += '.trs'

        response = HttpResponse(trs, content_type='application/zip')
        response['Content-Disposition'] = f'attachment; filename={filename}'
        return response


class TrsImportView(views.APIView):
    ''' Endpoint: Upload RS form in Exteor format. '''
    serializer_class = s.FileSerializer

    def post(self, request):
        data = utils.read_trs(request.FILES['file'].file)
        owner = self.request.user
        if owner.is_anonymous:
            owner = None
        _prepare_rsform_data(data, request, owner)
        serializer = s.RSFormTRSSerializer(data=data, context={'load_meta': True})
        serializer.is_valid(raise_exception=True)
        schema = serializer.save()
        result = s.LibraryItemSerializer(schema.item)
        return Response(status=201, data=result.data)


@api_view(['POST'])
def create_rsform(request):
    ''' Endpoint: Create RSForm from user input and/or trs file. '''
    owner = request.user
    if owner.is_anonymous:
        owner = None
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
        data = utils.read_trs(request.FILES['file'].file)
        _prepare_rsform_data(data, request, owner)
        serializer = s.RSFormTRSSerializer(data=data, context={'load_meta': True})
        serializer.is_valid(raise_exception=True)
        schema = serializer.save()
    result = s.LibraryItemSerializer(schema.item)
    return Response(status=201, data=result.data)

def _prepare_rsform_data(data: dict, request, owner: m.User):
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

@api_view(['POST'])
def parse_expression(request):
    ''' Endpoint: Parse RS expression. '''
    serializer = s.ExpressionSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    expression = serializer.validated_data['expression']
    result = pyconcept.parse_expression(expression)
    return Response(json.loads(result))


@api_view(['POST'])
def convert_to_ascii(request):
    ''' Endpoint: Convert expression to ASCII syntax. '''
    serializer = s.ExpressionSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    expression = serializer.validated_data['expression']
    result = pyconcept.convert_to_ascii(expression)
    return Response({'result': result})


@api_view(['POST'])
def convert_to_math(request):
    ''' Endpoint: Convert expression to MATH syntax. '''
    serializer = s.ExpressionSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    expression = serializer.validated_data['expression']
    result = pyconcept.convert_to_math(expression)
    return Response({'result': result})
