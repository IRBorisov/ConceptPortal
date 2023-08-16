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
    '''
    Get list of rsforms available for active user.
    '''
    permission_classes = (permissions.AllowAny,)
    serializer_class = serializers.RSFormSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_anonymous:
            return models.RSForm.objects.filter(Q(is_common=True) | Q(owner=user))
        else:
            return models.RSForm.objects.filter(is_common=True)


class ConstituentAPIView(generics.RetrieveUpdateAPIView):
    queryset = models.Constituenta.objects.all()
    serializer_class = serializers.ConstituentaSerializer

    def get_permissions(self):
        result = super().get_permissions()
        if self.request.method.lower() == 'get':
            result.append(permissions.AllowAny())
        else:
            result.append(utils.SchemaOwnerOrAdmin())
        return result


class RSFormViewSet(viewsets.ModelViewSet):
    queryset = models.RSForm.objects.all()
    serializer_class = serializers.RSFormSerializer

    filter_backends = (DjangoFilterBackend, filters.OrderingFilter)
    filterset_fields = ['owner', 'is_common']
    ordering_fields = ('owner', 'title', 'time_update')
    ordering = ('-time_update')

    def _get_schema(self) -> models.RSForm:
        return self.get_object()

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
        ''' Create new constituenta '''
        schema = self._get_schema()
        serializer = serializers.CstCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        if ('insert_after' in serializer.validated_data and serializer.validated_data['insert_after'] is not None):
            cstafter = models.Constituenta.objects.get(pk=serializer.validated_data['insert_after'])
            constituenta = schema.insert_at(cstafter.order + 1,
                                            serializer.validated_data['alias'],
                                            serializer.validated_data['cst_type'])
        else:
            constituenta = schema.insert_last(serializer.validated_data['alias'], serializer.validated_data['cst_type'])

        constituenta.convention = serializer.validated_data.get('convention', '')
        constituenta.term_raw = serializer.validated_data.get('term_raw', '')
        constituenta.term_resolved = serializer.validated_data.get('term_resolved', '')
        constituenta.definition_formal = serializer.validated_data.get('definition_formal', '')
        constituenta.definition_raw = serializer.validated_data.get('definition_raw', '')
        constituenta.definition_resolved = serializer.validated_data.get('definition_resolved', '')
        constituenta.save()
        schema.refresh_from_db()
        outSerializer = serializers.RSFormDetailsSerlializer(schema)
        response = Response(status=201, data={
            'new_cst': serializers.ConstituentaSerializer(constituenta).data,
            'schema': outSerializer.data})
        response['Location'] = constituenta.get_absolute_url()
        return response

    @action(detail=True, methods=['patch'], url_path='cst-multidelete')
    def cst_multidelete(self, request, pk):
        ''' Delete multiple constituents '''
        schema = self._get_schema()
        serializer = serializers.CstListSerlializer(data=request.data, context={'schema': schema})
        serializer.is_valid(raise_exception=True)
        schema.delete_cst(serializer.validated_data['constituents'])
        schema.refresh_from_db()
        outSerializer = serializers.RSFormDetailsSerlializer(schema)
        return Response(status=202, data=outSerializer.data)

    @action(detail=True, methods=['patch'], url_path='cst-moveto')
    def cst_moveto(self, request, pk):
        ''' Delete multiple constituents '''
        schema: models.RSForm = self._get_schema()
        serializer = serializers.CstMoveSerlializer(data=request.data, context={'schema': schema})
        serializer.is_valid(raise_exception=True)
        schema.move_cst(serializer.validated_data['constituents'], serializer.validated_data['move_to'])
        schema.refresh_from_db()
        outSerializer = serializers.RSFormDetailsSerlializer(schema)
        return Response(status=200, data=outSerializer.data)

    @action(detail=True, methods=['patch'], url_path='reset-aliases')
    def reset_aliases(self, request, pk):
        ''' Recreate all aliases based on order '''
        schema = self._get_schema()
        result = json.loads(pyconcept.reset_aliases(json.dumps(schema.to_trs())))
        schema.load_trs(data=result, sync_metadata=False, skip_update=True)
        outSerializer = serializers.RSFormDetailsSerlializer(schema)
        return Response(status=200, data=outSerializer.data)

    @action(detail=True, methods=['patch'], url_path='load-trs')
    def load_trs(self, request, pk):
        ''' Load data from file and replace current schema '''
        serializer = serializers.RSFormUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        schema = self._get_schema()
        load_metadata = serializer.validated_data['load_metadata']
        data = utils.read_trs(request.FILES['file'].file)
        schema.load_trs(data, load_metadata, skip_update=False)
        outSerializer = serializers.RSFormDetailsSerlializer(schema)
        return Response(status=200, data=outSerializer.data)

    @action(detail=True, methods=['post'], url_path='clone')
    def clone(self, request, pk):
        ''' Clone RSForm constituents and create new schema using new metadata '''
        serializer = serializers.RSFormSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        new_schema = models.RSForm.objects.create(
            title=serializer.validated_data['title'],
            owner=self.request.user,
            alias=serializer.validated_data.get('alias', ''),
            comment=serializer.validated_data.get('comment', ''),
            is_common=serializer.validated_data.get('is_common', False),
        )
        new_schema.load_trs(data=self._get_schema().to_trs(), sync_metadata=False, skip_update=True)
        outSerializer = serializers.RSFormDetailsSerlializer(new_schema)
        return Response(status=201, data=outSerializer.data)

    @action(detail=True, methods=['post'])
    def claim(self, request, pk=None):
        schema = self._get_schema()
        if schema.owner == self.request.user:
            return Response(status=304)
        else:
            schema.owner = self.request.user
            schema.save()
            return Response(status=200, data=serializers.RSFormSerializer(schema).data)

    @action(detail=True, methods=['get'])
    def contents(self, request, pk):
        ''' View schema db contents (including constituents) '''
        schema = serializers.RSFormContentsSerializer(self._get_schema()).data
        return Response(schema)

    @action(detail=True, methods=['get'])
    def details(self, request, pk):
        ''' Detailed schema view including statuses '''
        schema = self._get_schema()
        serializer = serializers.RSFormDetailsSerlializer(schema)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def check(self, request, pk):
        ''' Check RS expression against schema context '''
        schema = self._get_schema().to_trs()
        serializer = serializers.ExpressionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        expression = serializer.validated_data['expression']
        result = pyconcept.check_expression(json.dumps(schema), expression)
        return Response(json.loads(result))

    @action(detail=True, methods=['get'], url_path='export-trs')
    def export_trs(self, request, pk):
        ''' Download Exteor compatible file '''
        schema = self._get_schema().to_trs()
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
    ''' Upload RS form in Exteor format '''
    serializer_class = serializers.FileSerializer

    def post(self, request, format=None):
        data = utils.read_trs(request.FILES['file'].file)
        owner = self.request.user
        if owner.is_anonymous:
            owner = None
        schema = models.RSForm.create_from_trs(owner, data)
        result = serializers.RSFormSerializer(schema)
        return Response(status=201, data=result.data)


@api_view(['POST'])
def create_rsform(request):
    ''' Create RSForm from user input and/or trs file '''
    owner = request.user
    if owner.is_anonymous:
        owner = None
    if ('file' not in request.FILES):
        serializer = serializers.RSFormSerializer(data=request.data)
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
        if ('title' in request.data and request.data['title'] != ''):
            data['title'] = request.data['title']
        if data['title'] == '':
            data['title'] = 'Без названия ' + request.FILES['file'].fileName
        if ('alias' in request.data and request.data['alias'] != ''):
            data['alias'] = request.data['alias']
        if ('comment' in request.data and request.data['comment'] != ''):
            data['comment'] = request.data['comment']
        is_common = True
        if ('is_common' in request.data):
            is_common = request.data['is_common'] == 'true'
        schema = models.RSForm.create_from_trs(owner, data, is_common)
    result = serializers.RSFormSerializer(schema)
    return Response(status=201, data=result.data)


@api_view(['POST'])
def parse_expression(request):
    '''Parse RS expression '''
    serializer = serializers.ExpressionSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    expression = serializer.validated_data['expression']
    result = pyconcept.parse_expression(expression)
    return Response(json.loads(result))


@api_view(['POST'])
def convert_to_ascii(request):
    ''' Convert to ASCII syntax '''
    serializer = serializers.ExpressionSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    expression = serializer.validated_data['expression']
    result = pyconcept.convert_to_ascii(expression)
    return Response({'result': result})


@api_view(['POST'])
def convert_to_math(request):
    '''Convert to MATH syntax '''
    serializer = serializers.ExpressionSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    expression = serializer.validated_data['expression']
    result = pyconcept.convert_to_math(expression)
    return Response({'result': result})
