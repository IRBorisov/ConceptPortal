''' Endpoints for versions. '''
from typing import cast

from django.http import HttpResponse
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import generics
from rest_framework import status as c
from rest_framework import viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.request import Request
from rest_framework.response import Response

from apps.rsform import utils
from apps.rsform.models import RSForm
from apps.rsform.serializers import RSFormParseSerializer, RSFormSerializer, RSFormTRSSerializer
from shared import permissions, utility

from .. import models as m
from .. import serializers as s


@extend_schema(tags=['Version'])
@extend_schema_view()
class VersionViewset(
    viewsets.GenericViewSet,
    generics.RetrieveUpdateDestroyAPIView,
    permissions.EditorMixin
):
    ''' Endpoint: Get / Update Constituenta. '''
    queryset = m.Version.objects.all()
    serializer_class = s.VersionSerializer

    @extend_schema(
        summary='restore version data into current item',
        request=None,
        responses={
            c.HTTP_200_OK: RSFormParseSerializer,
            c.HTTP_403_FORBIDDEN: None,
            c.HTTP_404_NOT_FOUND: None
        }
    )
    @action(detail=True, methods=['patch'], url_path='restore')
    def restore(self, request: Request, pk):
        ''' Restore version data into current item. '''
        version = cast(m.Version, self.get_object())
        item = cast(m.LibraryItem, version.item)
        RSFormSerializer(item).restore_from_version(version.data)
        return Response(
            status=c.HTTP_200_OK,
            data=RSFormParseSerializer(item).data
        )


@extend_schema(
    summary='export versioned data as file',
    tags=['Version'],
    request=None,
    responses={
        (c.HTTP_200_OK, 'application/zip'): bytes,
        c.HTTP_404_NOT_FOUND: None
    }
)
@api_view(['GET'])
def export_file(request: Request, pk: int):
    ''' Endpoint: Download Exteor compatible file for versioned data. '''
    try:
        version = m.Version.objects.get(pk=pk)
    except m.Version.DoesNotExist:
        return Response(status=c.HTTP_404_NOT_FOUND)
    data = RSFormTRSSerializer(version.item).from_versioned_data(version.data)
    file = utility.write_zipped_json(data, utils.EXTEOR_INNER_FILENAME)
    filename = utils.filename_for_schema(data['alias'])
    response = HttpResponse(file, content_type='application/zip')
    response['Content-Disposition'] = f'attachment; filename={filename}'
    return response


@extend_schema(
    summary='save version for RSForm copying current content',
    tags=['Version'],
    request=s.VersionCreateSerializer,
    responses={
        c.HTTP_201_CREATED: s.NewVersionResponse,
        c.HTTP_400_BAD_REQUEST: None,
        c.HTTP_403_FORBIDDEN: None,
        c.HTTP_404_NOT_FOUND: None
    }
)
@api_view(['POST'])
@permission_classes([permissions.GlobalUser])
def create_version(request: Request, pk_item: int):
    ''' Endpoint: Create new version for RSForm copying current content. '''
    try:
        item = m.LibraryItem.objects.get(pk=pk_item)
    except m.LibraryItem.DoesNotExist:
        return Response(status=c.HTTP_404_NOT_FOUND)
    creator = request.user
    if not creator.is_staff and creator != item.owner:
        return Response(status=c.HTTP_403_FORBIDDEN)

    version_input = s.VersionCreateSerializer(data=request.data)
    version_input.is_valid(raise_exception=True)
    data = RSFormSerializer(item).to_versioned_data()
    result = RSForm(item).create_version(
        version=version_input.validated_data['version'],
        description=version_input.validated_data['description'],
        data=data
    )
    return Response(
        status=c.HTTP_201_CREATED,
        data={
            'version': result.pk,
            'schema': RSFormParseSerializer(item).data
        }
    )


@extend_schema(
    summary='retrieve versioned data for RSForm',
    tags=['Version'],
    request=None,
    responses={
        c.HTTP_200_OK: RSFormParseSerializer,
        c.HTTP_404_NOT_FOUND: None
    }
)
@api_view(['GET'])
def retrieve_version(request: Request, pk_item: int, pk_version: int):
    ''' Endpoint: Retrieve version for RSForm. '''
    try:
        item = m.LibraryItem.objects.get(pk=pk_item)
    except m.LibraryItem.DoesNotExist:
        return Response(status=c.HTTP_404_NOT_FOUND)
    try:
        version = m.Version.objects.get(pk=pk_version)
    except m.Version.DoesNotExist:
        return Response(status=c.HTTP_404_NOT_FOUND)
    if version.item != item:
        return Response(status=c.HTTP_404_NOT_FOUND)

    data = RSFormParseSerializer(item).from_versioned_data(version.pk, version.data)
    return Response(
        status=c.HTTP_200_OK,
        data=data
    )
