''' Endpoints for cctext. '''
import cctext as ct
from drf_spectacular.utils import extend_schema
from rest_framework import status as c
from rest_framework.decorators import api_view
from rest_framework.request import Request
from rest_framework.response import Response

from .. import serializers as s


@extend_schema(
    summary='generate wordform',
    tags=['NaturalLanguage'],
    request=s.WordFormSerializer,
    responses={200: s.ResultTextResponse},
    auth=None
)
@api_view(['POST'])
def inflect(request: Request):
    ''' Endpoint: Generate wordform with set grammemes. '''
    serializer = s.WordFormSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    text = serializer.validated_data['text']
    grams = serializer.validated_data['grams']
    result = ct.inflect(text, grams)
    return Response(
        status=c.HTTP_200_OK,
        data={'result': result}
    )


@extend_schema(
    summary='all wordforms for current lexeme',
    tags=['NaturalLanguage'],
    request=s.TextSerializer,
    responses={200: s.MultiFormSerializer},
    auth=None
)
@api_view(['POST'])
def generate_lexeme(request: Request):
    ''' Endpoint: Generate complete set of wordforms for lexeme. '''
    serializer = s.TextSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    nominal = serializer.validated_data['text']
    result = ct.generate_lexeme(nominal)
    return Response(
        status=c.HTTP_200_OK,
        data=s.MultiFormSerializer.from_list(result)
    )


@extend_schema(
    summary='get likely parse grammemes',
    tags=['NaturalLanguage'],
    request=s.TextSerializer,
    responses={200: s.ResultTextResponse},
    auth=None
)
@api_view(['POST'])
def parse_text(request: Request):
    ''' Endpoint: Get likely vocabulary parse. '''
    serializer = s.TextSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    text = serializer.validated_data['text']
    result = ct.parse(text)
    return Response(
        status=c.HTTP_200_OK,
        data={'result': result}
    )
