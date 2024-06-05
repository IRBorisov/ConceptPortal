import copy

from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.request import Request
from rest_framework.response import Response

from ..models.Constituenta import Constituenta
from ..models.LibraryItem import LibraryItem
from ..models.api_RSForm import RSForm
from ..serializers import RSFormSerializer, SynthesisGraphSerializer, InlineSynthesisSerializer
from typing import cast
from django.contrib.auth.models import User

from ..utils import clone_rsform


@extend_schema(
    summary='Run synthesis operation',
    tags=['Synthesis'],
    request=InlineSynthesisSerializer,
    responses={status.HTTP_200_OK: RSFormSerializer},
    auth=None
)
@api_view(['POST'])
def run_synthesis_view(request: Request):
    serializer = InlineSynthesisSerializer(
        data=request.data,
        context={'user': request.user}
    )
    serializer.is_valid(raise_exception=True)
    return run_synthesis(serializer=serializer)


@extend_schema(
    summary='Run synthesis graph',
    tags=['Synthesis'],
    request=InlineSynthesisSerializer,
    responses={status.HTTP_200_OK: RSFormSerializer},
    auth=None
)
@api_view(['POST'])
def run_sythesis_graph_view(request: Request):
    serializer = SynthesisGraphSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    for atomic_synthesis in serializer.validated_data:
        run_synthesis(atomic_synthesis)


def run_synthesis(serializer: InlineSynthesisSerializer):
    left_schema = RSForm(serializer.validated_data['source'])
    right_schema = RSForm(serializer.validated_data['receiver'])
    constituents = cast(list[Constituenta], serializer.validated_data['items'])

    left_schema_copy = clone_rsform(left_schema)
    copied_constituents = left_schema_copy.item.constituenta_set
    used_constiuents = set()

    for substitution in serializer.validated_data['substitutions']:
        original = cast(Constituenta, substitution['original'])
        replacement = cast(Constituenta, substitution['substitution'])
        if original in constituents:
            index = next(i for (i, cst) in enumerate(constituents) if cst == original)
            original = copied_constituents[index]
        else:
            index = next(i for (i, cst) in enumerate(constituents) if cst == replacement)
            replacement = copied_constituents[index]
        left_schema_copy.substitute(original, replacement, substitution['transfer_term'])
        if substitution['transfer_term']:
            used_constiuents.add(replacement.pk)
    unused_constitunents = {cst for cst in right_schema.item.constituenta_set() if cst.pk not in used_constiuents}
    left_schema_copy.insert_copy(list(unused_constitunents))

    left_schema.restore_order()
    return Response(
        status=status.HTTP_200_OK,
        data=RSFormSerializer(left_schema_copy.item).data
    )

    return
    right_rsform_copy = clone_rsform(right_schema)

    serializer.is_valid(raise_exception=True)

    try:
        mapping = serializer.validated_data['mapping']
        left_cst_pks = [x.get("left_cst_pk") for x in mapping]
        right_cst_pks = [x.get("right_cst_pk") for x in mapping]
        directions = [x.get("mapping_direction") for x in mapping]
        left_csts = left_schema.item.constituenta_set.filter(pk__in=left_cst_pks)
        right_csts = right_schema.item.constituenta_set.filter(pk__in=right_cst_pks)

        left_mapping_dict = {left.alias: right.alias for left, right, direction in
                             zip(left_csts, right_csts, directions) if
                             not direction}
        right_mapping_dict = {right.alias: left.alias for left, right, direction in
                              zip(left_csts, right_csts, directions)
                              if direction}

        left_schema_copy.apply_mapping(mapping=left_mapping_dict)
        right_rsform_copy.apply_mapping(mapping=right_mapping_dict)
        left_schema_copy.resolve_all_text()
        right_rsform_copy.resolve_all_text()
        left_schema_copy.item.save()
        right_rsform_copy.item.save()

        for left, right in zip(left_csts, right_csts):
            # left_rsform_copy.substitute(original=left, substitution=right, transfer_term=False)
            # right_rsform_copy.substitute(original=right, substitution=left, transfer_term=False)
            left_schema_copy.item.save()
            right_rsform_copy.item.save()

        right_cst_pks = set(right_cst_pks)
        for cst in right_rsform_copy.item.constituenta_set.all():
            if cst.pk not in right_cst_pks:
                max_idx = left_schema.get_max_index(cst.cst_type)
                left_schema_copy.insert_copy(items=[cst], position=max_idx + 1)
                left_schema_copy.item.save()

        right_rsform_copy.item.delete()

        serializer = RSFormParseSerializer(cast(LibraryItem, left_schema_copy.item))

        # TODO: remove next line
        left_schema_copy.item.delete()

        return Response(
            status=status.HTTP_200_OK,
            data=serializer.data
        )
    # TODO: rework 500
    except Exception as e:
        left_schema_copy.item.delete()
        right_rsform_copy.item.delete()
        raise e
        return Response(
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
