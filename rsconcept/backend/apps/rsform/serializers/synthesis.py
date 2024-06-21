from rest_framework import serializers
from .data_access import CstSubstituteSerializerBase
from rest_framework.serializers import PrimaryKeyRelatedField as PKField

from ..models import Constituenta, LibraryItem
from ..models.Synthesis import SynthesisGraph, SynthesisEdge, InputNode, OperationNode, SynthesisSubstitution


class SynthesisGraphSerializer(serializers.ModelSerializer):
    class Meta:
        model = SynthesisGraph
        fields = '__all__'

    def create(self, validated_data):
        graph, created = SynthesisGraph.objects.update_or_create(
            id=validated_data['id'],
            defaults={'status': validated_data['status']}
        )
        return graph


class InputNodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = InputNode
        fields = '__all__'

    def create(self, validated_data_list):
        for validated_data in validated_data_list:
            input_node, created = InputNode.objects.update_or_create(
                id=validated_data['id'] if validated_data.get('id') else None,
                defaults={
                    'graph_id': validated_data['graph_id'],
                    'vertical_coordinate': validated_data['vertical_coordinate'],
                    'horizontal_coordinate': validated_data['horizontal_coordinate'],
                    'rsform_id': validated_data['rsform_id'],
                }
            )
        return


class OperationNodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = OperationNode
        fields = '__all__'

    def create(self, validated_data_list):
        operations = []
        for validated_data in validated_data_list:
            operation_node, created = OperationNode.objects.update_or_create(
                id=validated_data['id'],
                defaults={
                    'graph_id': validated_data['graph_id'],
                    'vertical_coordinate': validated_data['vertical_coordinate'],
                    'horizontal_coordinate': validated_data['horizontal_coordinate'],
                    'rsform_id': validated_data['rsform_id'],
                    'left_parent': validated_data.get('left_parent'),
                    'right_parent': validated_data.get('right_parent'),
                }
            )
            operations.append(operation_node)
        return operations


class SynthesisSubstitutionSerializer(serializers.ModelSerializer):
    class Meta:
        model = SynthesisSubstitution
        fields = '__all__'

    def create(self, validated_data_list):
        substitutions = []
        for validated_data in validated_data_list:
            substitution, created = SynthesisSubstitution.objects.update_or_create(
                id=validated_data['id'],
                defaults={
                    'operation_id': validated_data['operation_id'],
                    'graph_id': validated_data['graph_id'],
                    'leftCst': validated_data['leftCst'],
                    'rightCst': validated_data['rightCst'],
                    'deleteRight': validated_data['deleteRight'],
                    'takeLeftTerm': validated_data['takeLeftTerm'],
                }
            )
            substitutions.append(substitution)
        return substitutions


class SynthesisEdgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = SynthesisEdge
        fields = '__all__'

    def create(self, validated_data_list):
        for validated_data in validated_data_list:
            substitution, created = SynthesisEdge.objects.update_or_create(
                id=validated_data['id'],
                defaults={
                    'graph_id': validated_data['graph_id'],
                    'decoded_id': validated_data['decoded_id'],
                    'source_handle': validated_data['source_handle'],
                    'node_from': validated_data['node_from'],
                    'node_to': validated_data['node_to'],
                }
            )
        return


class RunSingleSynthesis(serializers.Serializer):
    operationId = serializers.IntegerField()


class RunSingleSynthesisResponse(serializers.Serializer):
    rsformId = serializers.IntegerField()
