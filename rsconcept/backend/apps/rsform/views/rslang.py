''' Endpoints pyconcept formal language parsing. '''
import json

import pyconcept
from drf_spectacular.utils import extend_schema
from rest_framework import status as c
from rest_framework.decorators import api_view
from rest_framework.request import Request
from rest_framework.response import Response

from .. import serializers as s


@extend_schema(
    summary='RS expression into Syntax Tree',
    tags=['FormalLanguage'],
    request=s.ExpressionSerializer,
    responses={c.HTTP_200_OK: s.ExpressionParseSerializer},
    auth=None
)
@api_view(['POST'])
def parse_expression(request: Request):
    ''' Endpoint: Parse RS expression. '''
    serializer = s.ExpressionSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    expression = serializer.validated_data['expression']
    result = pyconcept.parse_expression(expression)
    return Response(
        status=c.HTTP_200_OK,
        data=json.loads(result)
    )


@extend_schema(
    summary='Unicode syntax to ASCII TeX',
    tags=['FormalLanguage'],
    request=s.ExpressionSerializer,
    responses={c.HTTP_200_OK: s.ResultTextResponse},
    auth=None
)
@api_view(['POST'])
def convert_to_ascii(request: Request):
    ''' Endpoint: Convert expression to ASCII syntax. '''
    serializer = s.ExpressionSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    expression = serializer.validated_data['expression']
    result = pyconcept.convert_to_ascii(expression)
    return Response(
        status=c.HTTP_200_OK,
        data={'result': result}
    )


@extend_schema(
    summary='ASCII TeX syntax to Unicode symbols',
    tags=['FormalLanguage'],
    request=s.ExpressionSerializer,
    responses={200: s.ResultTextResponse},
    auth=None
)
@api_view(['POST'])
def convert_to_math(request: Request):
    ''' Endpoint: Convert expression to MATH syntax. '''
    serializer = s.ExpressionSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    expression = serializer.validated_data['expression']
    result = pyconcept.convert_to_math(expression)
    return Response(
        status=c.HTTP_200_OK,
        data={'result': result}
    )
