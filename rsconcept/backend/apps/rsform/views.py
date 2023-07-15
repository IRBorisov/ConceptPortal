import json
from django.http import HttpResponse
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import action
from rest_framework import views, viewsets, filters
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import permissions

import pyconcept
from . import models
from . import serializers
from . import utils


class RSFormViewSet(viewsets.ModelViewSet):
    queryset = models.RSForm.objects.all()
    serializer_class = serializers.RSFormSerializer

    filter_backends = (DjangoFilterBackend, filters.OrderingFilter)
    filterset_fields = ['owner', 'is_common']
    ordering_fields = ('owner', 'title', 'time_update')
    ordering = ('-time_update')

    def perform_create(self, serializer):
        if not self.request.user.is_anonymous and 'owner' not in self.request.POST:
            return serializer.save(owner=self.request.user)
        else:
            return serializer.save()

    def get_permissions(self):
        if self.action in ['update', 'destroy', 'partial_update']:
            permission_classes = [utils.ObjectOwnerOrAdmin]
        elif self.action in ['create', 'claim']:
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.AllowAny]
        return [permission() for permission in permission_classes]

    @action(detail=True, methods=['post'])
    def claim(self, request, pk=None):
        schema: models.RSForm = self.get_object()
        if schema.owner == self.request.user:
            return Response(status=304)
        else:
            schema.owner = self.request.user
            schema.save()
            return Response(status=200)

    @action(detail=True, methods=['get'])
    def contents(self, request, pk):
        ''' View schema contents (including constituents) '''
        schema = self.get_object().to_json()
        return Response(schema)

    @action(detail=True, methods=['get'])
    def details(self, request, pk):
        ''' Detailed schema view including statuses '''
        schema: models.RSForm = self.get_object()
        result = pyconcept.check_schema(json.dumps(schema.to_json()))
        output_data = json.loads(result)
        output_data['id'] = schema.id
        output_data['time_update'] = schema.time_update
        output_data['time_create'] = schema.time_create
        output_data['is_common'] = schema.is_common
        output_data['owner'] = (schema.owner.pk if schema.owner is not None else None)
        return Response(output_data)

    @action(detail=True, methods=['post'])
    def check(self, request, pk):
        ''' Check RS expression against schema context '''
        schema = self.get_object().to_json()
        serializer = serializers.ExpressionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        expression = serializer.validated_data['expression']
        result = pyconcept.check_expression(json.dumps(schema), expression)
        return Response(json.loads(result))

    @action(detail=True, methods=['get'], url_path='export-trs')
    def export_trs(self, request, pk):
        ''' Download Exteor compatible file '''
        schema = self.get_object().to_json()
        trs = utils.write_trs(schema)
        filename = self.get_object().alias
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
        schema = models.RSForm.import_json(owner, data)
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
            title=request.data['title'],
            owner=owner,
            alias=request.data.get('alias', ''),
            comment=request.data.get('comment', ''),
            is_common=request.data.get('is_common', False),
        )
    else:
        data = utils.read_trs(request.FILES['file'].file)
        if ('title' in request.data and request.data['title'] != ''):
            data['title'] = request.data['title']
        if ('alias' in request.data and request.data['alias'] != ''):
            data['alias'] = request.data['alias']
        if ('comment' in request.data and request.data['comment'] != ''):
            data['comment'] = request.data['comment']
        is_common = True
        if ('is_common' in request.data):
            is_common = request.data['is_common']
        schema = models.RSForm.import_json(owner, data, is_common)
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
