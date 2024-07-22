''' Serializers for persistent data manipulation. '''
from typing import cast

from django.db.models import F
from rest_framework import serializers
from rest_framework.serializers import PrimaryKeyRelatedField as PKField

from apps.rsform.models import LibraryItem
from apps.rsform.serializers import LibraryItemDetailsSerializer
from shared import messages as msg

from ..models import Argument, Operation, OperationSchema, OperationType
from .basics import OperationPositionSerializer, SubstitutionExSerializer


class OperationSerializer(serializers.ModelSerializer):
    ''' Serializer: Operation data. '''
    class Meta:
        ''' serializer metadata. '''
        model = Operation
        fields = '__all__'
        read_only_fields = ('id', 'oss')


class ArgumentSerializer(serializers.ModelSerializer):
    ''' Serializer: Operation data. '''
    class Meta:
        ''' serializer metadata. '''
        model = Argument
        fields = ('operation', 'argument')


class OperationCreateSerializer(serializers.Serializer):
    ''' Serializer: Operation creation. '''
    class OperationData(serializers.ModelSerializer):
        ''' Serializer: Operation creation data. '''
        alias = serializers.CharField()
        operation_type = serializers.ChoiceField(OperationType.choices)

        class Meta:
            ''' serializer metadata. '''
            model = Operation
            fields = \
                'alias', 'operation_type', 'title', \
                'comment', 'result', 'position_x', 'position_y'

    item_data = OperationData()
    arguments = PKField(many=True, queryset=Operation.objects.all(), required=False)
    positions = serializers.ListField(
        child=OperationPositionSerializer(),
        default=[]
    )


class OperationDeleteSerializer(serializers.Serializer):
    ''' Serializer: Delete operation. '''
    target = PKField(many=False, queryset=Operation.objects.all())
    positions = serializers.ListField(
        child=OperationPositionSerializer(),
        default=[]
    )

    def validate(self, attrs):
        oss = cast(LibraryItem, self.context['oss'])
        operation = cast(Operation, attrs['target'])
        if oss and operation.oss != oss:
            raise serializers.ValidationError({
                f'{operation.id}': msg.operationNotOwned(oss.title)
            })
        self.instance = operation
        return attrs


class OperationSchemaSerializer(serializers.ModelSerializer):
    ''' Serializer: Detailed data for OSS. '''
    items = serializers.ListField(
        child=OperationSerializer()
    )
    arguments = serializers.ListField(
        child=ArgumentSerializer()
    )
    substitutions = serializers.ListField(
        child=SubstitutionExSerializer()
    )

    class Meta:
        ''' serializer metadata. '''
        model = OperationSchema
        fields = '__all__'

    def to_representation(self, instance: OperationSchema):
        result = LibraryItemDetailsSerializer(instance).data
        result['items'] = []
        for operation in instance.operations():
            result['items'].append(OperationSerializer(operation).data)
        result['arguments'] = []
        for argument in instance.arguments():
            result['arguments'].append(ArgumentSerializer(argument).data)
        result['substitutions'] = []
        for substitution in instance.substitutions().values(
            'operation',
            'original',
            'substitution',
            'transfer_term',
            original_alias=F('original__alias'),
            original_term=F('original__term_resolved'),
            substitution_alias=F('substitution__alias'),
            substitution_term=F('substitution__term_resolved'),
        ):
            result['substitutions'].append(substitution)
        return result
