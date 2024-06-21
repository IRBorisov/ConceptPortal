import copy

from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.request import Request
from rest_framework.response import Response
from django.db.models import Q
from rest_framework.views import APIView

from ..models.Constituenta import Constituenta
from ..models.LibraryItem import LibraryItem
from ..models.api_RSForm import RSForm
from ..models.Synthesis import SynthesisGraph, InputNode, OperationNode, SynthesisSubstitution, SynthesisEdge
from ..serializers import RSFormSerializer, SynthesisGraphSerializer, InlineSynthesisSerializer
from typing import cast
from django.contrib.auth.models import User

from ..serializers.data_access import CstBaseSerializer, CstSerializer
from ..serializers.synthesis import OperationNodeSerializer, InputNodeSerializer, \
    SynthesisSubstitutionSerializer, SynthesisEdgeSerializer, RunSingleSynthesis, RunSingleSynthesisResponse
from ..utils import clone_rsform


@extend_schema(
    summary='Get synthesis graph',
    tags=['Synthesis'],
    auth=None
)
@api_view(['GET'])
def get_synthesis_graph(request: Request, pk_item: int):
    input_nodes = InputNode.objects.filter(graph_id=pk_item)
    operation_nodes = OperationNode.objects.filter(graph_id=pk_item)
    edges = SynthesisEdge.objects.filter(graph_id=pk_item)
    substitutions = []
    for operation_node in operation_nodes:
        substitution_batch = SynthesisSubstitution.objects.filter(operation_id=operation_node.id)
        for substitution in substitution_batch:
            substitutions.append(substitution)

    synthesis_graph = SynthesisGraphSerializer()
    synthesis_graph.create(validated_data={'id': pk_item, 'status': 'Draft'})
    input_nodes = InputNodeSerializer(instance=input_nodes, many=True)
    operation_nodes = (OperationNodeSerializer(instance=operation_nodes, many=True))
    edges = SynthesisEdgeSerializer(instance=edges, many=True)
    substitutions = SynthesisSubstitutionSerializer(instance=substitutions, many=True)
    for substitution in substitutions.data:
        substitution['leftCst'] = CstSerializer(instance=Constituenta.objects.get(id=substitution['leftCst'])).data
        substitution['rightCst'] = CstSerializer(instance=Constituenta.objects.get(id=substitution['rightCst'])).data
    return Response(data={
        'graph': synthesis_graph.data,
        'input_nodes': input_nodes.data,
        'operation_nodes': operation_nodes.data,
        'edges': edges.data,
        'substitutions': substitutions.data,
    })


@extend_schema(
    summary='Save synthesis graph',
    tags=['Synthesis'],
    request=SynthesisGraphSerializer,
    responses={status.HTTP_200_OK: RSFormSerializer},
    auth=None
)
@api_view(['POST'])
def save_synthesis_graph(request: Request):
    graph_data = request.data.get('graph')
    input_nodes_data = request.data.get('input_nodes')
    operation_nodes_data = request.data.get('operation_nodes')
    edges_data = request.data.get('edges')
    substitutions_data = request.data.get('substitutions')

    synthesis_graph_serializer = SynthesisGraphSerializer()
    graph = synthesis_graph_serializer.create(validated_data=graph_data)

    InputNode.objects.filter(graph_id=graph).delete()
    OperationNode.objects.filter(graph_id=graph).delete()
    SynthesisEdge.objects.filter(graph_id=graph).delete()
    SynthesisSubstitution.objects.filter(graph_id=graph).delete()

    input_node_serializer = InputNodeSerializer()
    for input_node in input_nodes_data:
        input_node['graph_id'] = graph
    input_node_serializer.create(validated_data_list=input_nodes_data)

    for operation_node in operation_nodes_data:
        operation_node['graph_id'] = graph
        operation_node['left_parent'] = LibraryItem.objects.get(id=operation_node['left_parent'])
        operation_node['right_parent'] = LibraryItem.objects.get(id=operation_node['right_parent'])
    operation_node_serializer = OperationNodeSerializer()
    operations = operation_node_serializer.create(validated_data_list=operation_nodes_data)

    for edge in edges_data:
        edge['graph_id'] = graph

    edge_serializer = SynthesisEdgeSerializer()
    edge_serializer.create(validated_data_list=edges_data)

    operations_dict = {operation.id: operation for operation in operations}
    for substitution_data in substitutions_data:
        substitution_data['operation_id'] = operations_dict[substitution_data['operation_id']]
        substitution_data['rightCst'] = Constituenta.objects.get(id=substitution_data['rightCst']['id'])
        substitution_data['leftCst'] = Constituenta.objects.get(id=substitution_data['leftCst']['id'])
        substitution_data['graph_id'] = graph

    substitution_serializer = SynthesisSubstitutionSerializer()
    substitutions = substitution_serializer.create(validated_data_list=substitutions_data)

    return Response(synthesis_graph_serializer.data, status=status.HTTP_201_CREATED)


@extend_schema(
    summary='Run synthesis graph',
    tags=['Synthesis'],
    request=RunSingleSynthesis,
    responses={status.HTTP_200_OK: RunSingleSynthesisResponse},
    auth=None
)
@api_view(['POST'])
def run_sythesis_graph_view(request: Request):
    serializer = RunSingleSynthesis(data=request.data)
    serializer.is_valid(raise_exception=True)
    for atomic_synthesis in serializer.validated_data:
        run_synthesis(atomic_synthesis)


@extend_schema(
    summary='Run synthesis operation',
    tags=['Synthesis'],
    request=RunSingleSynthesis,
    responses={status.HTTP_200_OK: RunSingleSynthesisResponse},
    auth=None
)
@api_view(['POST'])
def run_synthesis_view(request: Request):
    serializer = RunSingleSynthesis(
        data=request.data
    )
    serializer.is_valid(raise_exception=True)
    return run_synthesis(serializer=serializer)


def run_synthesis(serializer: RunSingleSynthesis):
    operation_id = serializer.data['operationId']
    operation = OperationNode.objects.get(id=operation_id)

    left_schema = RSForm(operation.left_parent)
    right_schema = RSForm(operation.right_parent)
    substitutions = SynthesisSubstitution.objects.filter(operation_id=operation_id)

    left_schema_copy = clone_rsform(left_schema)
    right_constituents = right_schema.item.constituenta_set.filter()
    left_schema_copy.insert_copy(right_constituents)

    for substitution in substitutions:
        original = cast(Constituenta, substitution.leftCst)
        replacement = cast(Constituenta, substitution.rightCst)
        left_schema_copy.substitute(original, replacement, (not substitution.deleteRight) and substitution.takeLeftTerm)

    left_schema.restore_order()
    return Response(
        status=status.HTTP_200_OK,
        data=RSFormSerializer(left_schema_copy.item).data
    )

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
