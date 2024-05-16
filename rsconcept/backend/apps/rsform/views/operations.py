''' Endpoints for RSForm. '''
from typing import cast
from django.db import transaction
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
@transaction.atomic
@api_view(['PATCH'])
def inline_synthesis(request: Request):
    ''' Endpoint: Inline synthesis. '''
    serializer = s.InlineSynthesisSerializer(
        data=request.data,
        context={'user': request.user}
    )
    serializer.is_valid(raise_exception=True)

    schema = m.RSForm(serializer.validated_data['receiver'])
    items = cast(list[m.Constituenta], serializer.validated_data['items'])
    new_items = schema.insert_copy(items)

    for substitution in serializer.validated_data['substitutions']:
        original = cast(m.Constituenta, substitution['original'])
        replacement = cast(m.Constituenta, substitution['substitution'])
        if original in items:
            index = next(i for (i, cst) in enumerate(items) if cst == original)
            original = new_items[index]
        else:
            index = next(i for (i, cst) in enumerate(items) if cst == replacement)
            replacement = new_items[index]
        schema.substitute(original, replacement, substitution['transfer_term'])

    schema.restore_order()
    return Response(
        status=c.HTTP_200_OK,
        data=s.RSFormParseSerializer(schema.item).data
    )
