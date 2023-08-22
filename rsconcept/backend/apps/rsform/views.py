''' REST API: RSForms for conceptual schemas. '''
import json
from django.http import HttpResponse
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from rest_framework import views, viewsets, filters, generics, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.decorators import api_view

import pyconcept
from . import models
from . import serializers
from . import utils


class LibraryView(generics.ListAPIView):
    ''' Endpoint: Get list of rsforms available for active user. '''
    permission_classes = (permissions.AllowAny,)
    serializer_class = serializers.RSFormMetaSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_anonymous:
            return models.RSForm.objects.filter(Q(is_common=True) | Q(owner=user))
        else:
            return models.RSForm.objects.filter(is_common=True)


class ConstituentAPIView(generics.RetrieveUpdateAPIView):
    ''' Endpoint: Get / Update Constituenta. '''
    queryset = models.Constituenta.objects.all()
    serializer_class = serializers.ConstituentaSerializer

    def get_permissions(self):
        result = super().get_permissions()
        if self.request.method.lower() == 'get':
            result.append(permissions.AllowAny())
        else:
            result.append(utils.SchemaOwnerOrAdmin())
        return result


# pylint: disable=too-many-ancestors
class RSFormViewSet(viewsets.ModelViewSet):
    ''' Endpoint: RSForm operations. '''
    queryset = models.RSForm.objects.all()
    serializer_class = serializers.RSFormMetaSerializer

    filter_backends = (DjangoFilterBackend, filters.OrderingFilter)
    filterset_fields = ['owner', 'is_common']
    ordering_fields = ('owner', 'title', 'time_update')
    ordering = '-time_update'

    def _get_schema(self) -> models.RSForm:
        return self.get_object() # type: ignore

    def perform_create(self, serializer):
        if not self.request.user.is_anonymous and 'owner' not in self.request.POST:
            return serializer.save(owner=self.request.user)
        else:
            return serializer.save()

    def get_permissions(self):
        if self.action in ['update', 'destroy', 'partial_update', 'load_trs',
                           'cst_create', 'cst_multidelete', 'reset_aliases']:
            permission_classes = [utils.ObjectOwnerOrAdmin]
        elif self.action in ['create', 'claim', 'clone']:
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.AllowAny]
        return [permission() for permission in permission_classes]

    @action(detail=True, methods=['post'], url_path='cst-create')
    def cst_create(self, request, pk):
        ''' Create new constituenta. '''
        schema = self._get_schema()
        serializer = serializers.CstCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        new_cst = schema.create_cst(data, data['insert_after'] if 'insert_after' in data else None)
        schema.refresh_from_db()
        response = Response(status=201, data={
            'new_cst': serializers.ConstituentaSerializer(new_cst).data,
            'schema': models.PyConceptAdapter(schema).full()
        })
        response['Location'] = new_cst.get_absolute_url()
        return response

    @action(detail=True, methods=['patch'], url_path='cst-multidelete')
    def cst_multidelete(self, request, pk):
        ''' Endpoint: Delete multiple constituents. '''
        schema = self._get_schema()
        serializer = serializers.CstListSerlializer(data=request.data, context={'schema': schema})
        serializer.is_valid(raise_exception=True)
        schema.delete_cst(serializer.validated_data['constituents'])
        schema.refresh_from_db()
        return Response(status=202, data=models.PyConceptAdapter(schema).full())

    @action(detail=True, methods=['patch'], url_path='cst-moveto')
    def cst_moveto(self, request, pk):
        ''' Endpoint: Move multiple constituents. '''
        schema = self._get_schema()
        serializer = serializers.CstMoveSerlializer(data=request.data, context={'schema': schema})
        serializer.is_valid(raise_exception=True)
        schema.move_cst(serializer.validated_data['constituents'], serializer.validated_data['move_to'])
        schema.refresh_from_db()
        return Response(status=200, data=models.PyConceptAdapter(schema).full())

    @action(detail=True, methods=['patch'], url_path='reset-aliases')
    def reset_aliases(self, request, pk):
        ''' Endpoint: Recreate all aliases based on order. '''
        schema = self._get_schema()
        schema.reset_aliases()
        return Response(status=200, data=models.PyConceptAdapter(schema).full())

    @action(detail=True, methods=['patch'], url_path='load-trs')
    def load_trs(self, request, pk):
        ''' Endpoint: Load data from file and replace current schema. '''
        serializer = serializers.RSFormUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        schema = self._get_schema()
        load_metadata = serializer.validated_data['load_metadata']
        data = utils.read_trs(request.FILES['file'].file)
        data['id'] = schema.pk

        serializer = serializers.RSFormTRSSerializer(data=data, context={'load_meta': load_metadata})
        serializer.is_valid(raise_exception=True)
        schema = serializer.save()
        return Response(status=200, data=models.PyConceptAdapter(schema).full())

    @action(detail=True, methods=['post'], url_path='clone')
    def clone(self, request, pk):
        ''' Endpoint: Clone RSForm constituents and create new schema using new metadata. '''
        serializer = serializers.RSFormMetaSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        clone_data = serializers.RSFormTRSSerializer(self._get_schema()).data
        clone_data['owner'] = self.request.user
        clone_data['title'] = serializer.validated_data['title']
        clone_data['alias'] = serializer.validated_data.get('alias', '')
        clone_data['comment'] = serializer.validated_data.get('comment', '')
        clone_data['is_common'] = serializer.validated_data.get('is_common', False)

        clone = serializers.RSFormTRSSerializer(data=clone_data, context={'load_meta': True})
        clone.is_valid(raise_exception=True)
        new_schema = clone.save()
        return Response(status=201, data=models.PyConceptAdapter(new_schema).full())

    @action(detail=True, methods=['post'])
    def claim(self, request, pk=None):
        ''' Endpoint: Claim ownership of RSForm. '''
        schema = self._get_schema()
        if schema.owner == self.request.user:
            return Response(status=304)
        else:
            schema.owner = self.request.user
            schema.save()
            return Response(status=200, data=serializers.RSFormMetaSerializer(schema).data)

    @action(detail=True, methods=['get'])
    def contents(self, request, pk):
        ''' Endpoint: View schema db contents (including constituents). '''
        schema = serializers.RSFormContentsSerializer(self._get_schema()).data
        return Response(schema)

    @action(detail=True, methods=['get'])
    def details(self, request, pk):
        ''' Endpoint: Detailed schema view including statuses and parse. '''
        schema = self._get_schema()
        serializer = models.PyConceptAdapter(schema)
        return Response(serializer.full())

    @action(detail=True, methods=['post'])
    def check(self, request, pk):
        ''' Endpoint: Check RSLang expression against schema context. '''
        schema =  models.PyConceptAdapter(self._get_schema())
        serializer = serializers.ExpressionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        expression = serializer.validated_data['expression']
        result = pyconcept.check_expression(json.dumps(schema.data), expression)
        return Response(json.loads(result))

    @action(detail=True, methods=['get'], url_path='export-trs')
    def export_trs(self, request, pk):
        ''' Endpoint: Download Exteor compatible file. '''
        schema = serializers.RSFormTRSSerializer(self._get_schema()).data
        trs = utils.write_trs(schema)
        filename = self._get_schema().alias
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
    serializer_class = serializers.FileSerializer

    def post(self, request):
        data = utils.read_trs(request.FILES['file'].file)
        owner = self.request.user
        if owner.is_anonymous:
            owner = None
        _prepare_rsform_data(data, request, owner)
        serializer = serializers.RSFormTRSSerializer(data=data, context={'load_meta': True})
        serializer.is_valid(raise_exception=True)
        schema = serializer.save()
        result = serializers.RSFormMetaSerializer(schema)
        return Response(status=201, data=result.data)


@api_view(['POST'])
def create_rsform(request):
    ''' Endpoint: Create RSForm from user input and/or trs file. '''
    owner = request.user
    if owner.is_anonymous:
        owner = None
    if 'file' not in request.FILES:
        serializer = serializers.RSFormMetaSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        schema = models.RSForm.objects.create(
            title=serializer.validated_data['title'],
            owner=owner,
            alias=serializer.validated_data.get('alias', ''),
            comment=serializer.validated_data.get('comment', ''),
            is_common=serializer.validated_data.get('is_common', False),
        )
    else:
        data = utils.read_trs(request.FILES['file'].file)
        _prepare_rsform_data(data, request, owner)
        serializer = serializers.RSFormTRSSerializer(data=data, context={'load_meta': True})
        serializer.is_valid(raise_exception=True)
        schema = serializer.save()
    result = serializers.RSFormMetaSerializer(schema)
    return Response(status=201, data=result.data)

def _prepare_rsform_data(data: dict, request, owner: models.User):
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
    data['owner'] = owner

@api_view(['POST'])
def parse_expression(request):
    ''' Endpoint: Parse RS expression. '''
    serializer = serializers.ExpressionSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    expression = serializer.validated_data['expression']
    result = pyconcept.parse_expression(expression)
    return Response(json.loads(result))


@api_view(['POST'])
def convert_to_ascii(request):
    ''' Endpoint: Convert expression to ASCII syntax. '''
    serializer = serializers.ExpressionSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    expression = serializer.validated_data['expression']
    result = pyconcept.convert_to_ascii(expression)
    return Response({'result': result})


@api_view(['POST'])
def convert_to_math(request):
    ''' Endpoint: Convert expression to MATH syntax. '''
    serializer = serializers.ExpressionSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    expression = serializer.validated_data['expression']
    result = pyconcept.convert_to_math(expression)
    return Response({'result': result})
