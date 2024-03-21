''' Endpoints for RSForm. '''
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.request import Request
from drf_spectacular.utils import extend_schema
from rest_framework import status as c

from .. import models as m
from .. import serializers as s

@extend_schema(
    summary='Inline synthesis: merge one schema into another',
    tags=['Operations'],
    request=s.InlineSynthesisSerializer,
    responses={c.HTTP_200_OK: s.RSFormParseSerializer}
)
@api_view(['PATCH'])
def inline_synthesis(request: Request):
    ''' Endpoint: Inline synthesis. '''
    serializer = s.InlineSynthesisSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    schema = m.RSForm(serializer.validated_data['receiver'])
    # schema.substitute(
    #     original=serializer.validated_data['original'],
    #     substitution=serializer.validated_data['substitution'],
    #     transfer_term=serializer.validated_data['transfer_term']
    # )
    schema.item.refresh_from_db()
    return Response(
        status=c.HTTP_200_OK,
        data=s.RSFormParseSerializer(schema.item).data
    )
