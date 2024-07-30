''' Serializers for persistent data manipulation. '''
from typing import cast

from django.db.models import F
from rest_framework import serializers
from rest_framework.serializers import PrimaryKeyRelatedField as PKField

from apps.library.models import LibraryItem, LibraryItemType
from apps.library.serializers import LibraryItemDetailsSerializer
from apps.rsform.models import Constituenta
from apps.rsform.serializers import SubstitutionSerializerBase
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
    class OperationCreateData(serializers.ModelSerializer):
        ''' Serializer: Operation creation data. '''
        alias = serializers.CharField()
        operation_type = serializers.ChoiceField(OperationType.choices)

        class Meta:
            ''' serializer metadata. '''
            model = Operation
            fields = \
                'alias', 'operation_type', 'title', \
                'comment', 'result', 'position_x', 'position_y'

    create_schema = serializers.BooleanField(default=False, required=False)
    item_data = OperationCreateData()
    arguments = PKField(many=True, queryset=Operation.objects.all(), required=False)

    positions = serializers.ListField(
        child=OperationPositionSerializer(),
        default=[]
    )


class OperationUpdateSerializer(serializers.Serializer):
    ''' Serializer: Operation creation. '''
    class OperationUpdateData(serializers.ModelSerializer):
        ''' Serializer: Operation creation data. '''
        class Meta:
            ''' serializer metadata. '''
            model = Operation
            fields = 'alias', 'title', 'comment'

    target = PKField(many=False, queryset=Operation.objects.all())
    item_data = OperationUpdateData()
    arguments = PKField(many=True, queryset=Operation.objects.all(), required=False)
    substitutions = serializers.ListField(
        child=SubstitutionSerializerBase(),
        required=False
    )

    positions = serializers.ListField(
        child=OperationPositionSerializer(),
        default=[]
    )

    def validate(self, attrs):
        if 'arguments' not in attrs:
            return attrs

        oss = cast(LibraryItem, self.context['oss'])
        for operation in attrs['arguments']:
            if operation.oss != oss:
                raise serializers.ValidationError({
                    'arguments': msg.operationNotInOSS(oss.title)
                })

        if 'substitutions' not in attrs:
            return attrs
        schemas = [arg.result.pk for arg in attrs['arguments'] if arg.result is not None]
        deleted = set()
        for item in attrs['substitutions']:
            original_cst = cast(Constituenta, item['original'])
            substitution_cst = cast(Constituenta, item['substitution'])
            if original_cst.schema.pk not in schemas:
                raise serializers.ValidationError({
                    f'{original_cst.id}': msg.constituentaNotFromOperation()
                })
            if substitution_cst.schema.pk not in schemas:
                raise serializers.ValidationError({
                    f'{substitution_cst.id}': msg.constituentaNotFromOperation()
                })
            if original_cst.pk in deleted:
                raise serializers.ValidationError({
                    f'{original_cst.id}': msg.substituteDouble(original_cst.alias)
                })
            if original_cst.schema == substitution_cst.schema:
                raise serializers.ValidationError({
                    'alias': msg.substituteTrivial(original_cst.alias)
                })
            deleted.add(original_cst.pk)
        return attrs




class OperationTargetSerializer(serializers.Serializer):
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
                'target': msg.operationNotInOSS(oss.title)
            })
        return attrs


class SetOperationInputSerializer(serializers.Serializer):
    ''' Serializer: Set input schema for operation. '''
    target = PKField(many=False, queryset=Operation.objects.all())
    input = PKField(
        many=False,
        queryset=LibraryItem.objects.filter(item_type=LibraryItemType.RSFORM),
        allow_null=True,
        default=None
    )
    positions = serializers.ListField(
        child=OperationPositionSerializer(),
        default=[]
    )

    def validate(self, attrs):
        oss = cast(LibraryItem, self.context['oss'])
        operation = cast(Operation, attrs['target'])
        if oss and operation.oss != oss:
            raise serializers.ValidationError({
                'target': msg.operationNotInOSS(oss.title)
            })
        if operation.operation_type != OperationType.INPUT:
            raise serializers.ValidationError({
                'target': msg.operationNotInput(operation.alias)
            })
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
        model = LibraryItem
        fields = '__all__'

    def to_representation(self, instance: LibraryItem):
        result = LibraryItemDetailsSerializer(instance).data
        oss = OperationSchema(instance)
        result['items'] = []
        for operation in oss.operations():
            result['items'].append(OperationSerializer(operation).data)
        result['arguments'] = []
        for argument in oss.arguments():
            result['arguments'].append(ArgumentSerializer(argument).data)
        result['substitutions'] = []
        for substitution in oss.substitutions().values(
            'operation',
            'original',
            'substitution',
            original_alias=F('original__alias'),
            original_term=F('original__term_resolved'),
            substitution_alias=F('substitution__alias'),
            substitution_term=F('substitution__term_resolved'),
        ):
            result['substitutions'].append(substitution)
        return result
