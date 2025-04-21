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

from ..models import Argument, Block, Inheritance, Operation, OperationSchema, OperationType
from .basics import LayoutSerializer, SubstitutionExSerializer


class OperationSerializer(serializers.ModelSerializer):
    ''' Serializer: Operation data. '''
    class Meta:
        ''' serializer metadata. '''
        model = Operation
        fields = '__all__'
        read_only_fields = ('id', 'oss')


class BlockSerializer(serializers.ModelSerializer):
    ''' Serializer: Block data. '''
    class Meta:
        ''' serializer metadata. '''
        model = Block
        fields = '__all__'
        read_only_fields = ('id', 'oss')


class ArgumentSerializer(serializers.ModelSerializer):
    ''' Serializer: Operation data. '''
    class Meta:
        ''' serializer metadata. '''
        model = Argument
        fields = ('operation', 'argument')


class CreateBlockSerializer(serializers.Serializer):
    ''' Serializer: Block creation. '''
    class BlockCreateData(serializers.ModelSerializer):
        ''' Serializer: Block creation data. '''

        class Meta:
            ''' serializer metadata. '''
            model = Block
            fields = 'title', 'description', 'parent'

    layout = LayoutSerializer()
    item_data = BlockCreateData()
    width = serializers.FloatField()
    height = serializers.FloatField()
    position_x = serializers.FloatField()
    position_y = serializers.FloatField()
    children_operations = PKField(many=True, queryset=Operation.objects.all().only('oss_id'))
    children_blocks = PKField(many=True, queryset=Block.objects.all().only('oss_id'))

    def validate(self, attrs):
        oss = cast(LibraryItem, self.context['oss'])
        if 'parent' in attrs['item_data'] and \
                attrs['item_data']['parent'] is not None and \
                attrs['item_data']['parent'].oss_id != oss.pk:
            raise serializers.ValidationError({
                'parent': msg.parentNotInOSS()
            })

        for operation in attrs['children_operations']:
            if operation.oss_id != oss.pk:
                raise serializers.ValidationError({
                    'children_operations': msg.childNotInOSS()
                })

        for block in attrs['children_blocks']:
            if block.oss_id != oss.pk:
                raise serializers.ValidationError({
                    'children_blocks': msg.childNotInOSS()
                })
        return attrs


class UpdateBlockSerializer(serializers.Serializer):
    ''' Serializer: Block update. '''
    class UpdateBlockData(serializers.ModelSerializer):
        ''' Serializer: Block update data. '''
        class Meta:
            ''' serializer metadata. '''
            model = Block
            fields = 'title', 'description', 'parent'

    layout = LayoutSerializer(required=False)
    target = PKField(many=False, queryset=Block.objects.all())
    item_data = UpdateBlockData()

    def validate(self, attrs):
        oss = cast(LibraryItem, self.context['oss'])
        block = cast(Block, attrs['target'])
        if block.oss_id != oss.pk:
            raise serializers.ValidationError({
                'target': msg.blockNotInOSS()
            })

        if 'parent' in attrs['item_data'] and \
                attrs['item_data']['parent'] is not None:
            if attrs['item_data']['parent'].oss_id != oss.pk:
                raise serializers.ValidationError({
                    'parent': msg.parentNotInOSS()
                })
            if attrs['item_data']['parent'] == attrs['target']:
                raise serializers.ValidationError({
                    'parent': msg.blockSelfParent()
                })
        return attrs


class DeleteBlockSerializer(serializers.Serializer):
    ''' Serializer: Delete block. '''
    layout = LayoutSerializer()
    target = PKField(many=False, queryset=Block.objects.all().only('oss_id'))

    def validate(self, attrs):
        oss = cast(LibraryItem, self.context['oss'])
        block = cast(Block, attrs['target'])
        if block.oss_id != oss.pk:
            raise serializers.ValidationError({
                'target': msg.blockNotInOSS()
            })
        return attrs


class CreateOperationSerializer(serializers.Serializer):
    ''' Serializer: Operation creation. '''
    class CreateOperationData(serializers.ModelSerializer):
        ''' Serializer: Operation creation data. '''
        alias = serializers.CharField()
        operation_type = serializers.ChoiceField(OperationType.choices)

        class Meta:
            ''' serializer metadata. '''
            model = Operation
            fields = \
                'alias', 'operation_type', 'title', \
                'description', 'result', 'parent'

    layout = LayoutSerializer()
    item_data = CreateOperationData()
    position_x = serializers.FloatField()
    position_y = serializers.FloatField()
    create_schema = serializers.BooleanField(default=False, required=False)
    arguments = PKField(many=True, queryset=Operation.objects.all().only('pk'), required=False)

    def validate(self, attrs):
        oss = cast(LibraryItem, self.context['oss'])
        if 'parent' in attrs['item_data'] and \
                attrs['item_data']['parent'] is not None and \
                attrs['item_data']['parent'].oss_id != oss.pk:
            raise serializers.ValidationError({
                'parent': msg.parentNotInOSS()
            })

        if 'arguments' not in attrs:
            return attrs
        for operation in attrs['arguments']:
            if operation.oss_id != oss.pk:
                raise serializers.ValidationError({
                    'arguments': msg.operationNotInOSS()
                })
        return attrs


class UpdateOperationSerializer(serializers.Serializer):
    ''' Serializer: Operation update. '''
    class UpdateOperationData(serializers.ModelSerializer):
        ''' Serializer: Operation update data. '''
        class Meta:
            ''' serializer metadata. '''
            model = Operation
            fields = 'alias', 'title', 'description', 'parent'

    layout = LayoutSerializer(required=False)
    target = PKField(many=False, queryset=Operation.objects.all())
    item_data = UpdateOperationData()
    arguments = PKField(many=True, queryset=Operation.objects.all().only('oss_id', 'result_id'), required=False)
    substitutions = serializers.ListField(
        child=SubstitutionSerializerBase(),
        required=False
    )

    def validate(self, attrs):
        oss = cast(LibraryItem, self.context['oss'])
        target = cast(Block, attrs['target'])
        if target.oss_id != oss.pk:
            raise serializers.ValidationError({
                'target': msg.operationNotInOSS()
            })

        if 'parent' in attrs['item_data'] and \
                attrs['item_data']['parent'] is not None and \
                attrs['item_data']['parent'].oss_id != oss.pk:
            raise serializers.ValidationError({
                'parent': msg.parentNotInOSS()
            })

        if 'arguments' not in attrs:
            if 'substitutions' in attrs:
                raise serializers.ValidationError({
                    'arguments': msg.missingArguments()
                })
            return attrs

        for operation in attrs['arguments']:
            if operation.oss_id != oss.pk:
                raise serializers.ValidationError({
                    'arguments': msg.operationNotInOSS()
                })

        if 'substitutions' not in attrs:
            return attrs
        schemas = [arg.result_id for arg in attrs['arguments'] if arg.result is not None]
        substitutions = attrs['substitutions']
        to_delete = {x['original'].pk for x in substitutions}
        deleted = set()
        for item in substitutions:
            original_cst = cast(Constituenta, item['original'])
            substitution_cst = cast(Constituenta, item['substitution'])
            if original_cst.schema_id not in schemas:
                raise serializers.ValidationError({
                    f'{original_cst.pk}': msg.constituentaNotFromOperation()
                })
            if substitution_cst.schema_id not in schemas:
                raise serializers.ValidationError({
                    f'{substitution_cst.pk}': msg.constituentaNotFromOperation()
                })
            if original_cst.pk in deleted or substitution_cst.pk in to_delete:
                raise serializers.ValidationError({
                    f'{original_cst.pk}': msg.substituteDouble(original_cst.alias)
                })
            if original_cst.schema_id == substitution_cst.schema_id:
                raise serializers.ValidationError({
                    'alias': msg.substituteTrivial(original_cst.alias)
                })
            deleted.add(original_cst.pk)
        return attrs


class DeleteOperationSerializer(serializers.Serializer):
    ''' Serializer: Delete operation. '''
    layout = LayoutSerializer()
    target = PKField(many=False, queryset=Operation.objects.all().only('oss_id', 'result'))
    keep_constituents = serializers.BooleanField(default=False, required=False)
    delete_schema = serializers.BooleanField(default=False, required=False)

    def validate(self, attrs):
        oss = cast(LibraryItem, self.context['oss'])
        operation = cast(Operation, attrs['target'])
        if operation.oss_id != oss.pk:
            raise serializers.ValidationError({
                'target': msg.operationNotInOSS()
            })
        return attrs


class TargetOperationSerializer(serializers.Serializer):
    ''' Serializer: Target single operation. '''
    layout = LayoutSerializer()
    target = PKField(many=False, queryset=Operation.objects.all().only('oss_id', 'result_id'))

    def validate(self, attrs):
        oss = cast(LibraryItem, self.context['oss'])
        operation = cast(Operation, attrs['target'])
        if operation.oss_id != oss.pk:
            raise serializers.ValidationError({
                'target': msg.operationNotInOSS()
            })
        return attrs


class SetOperationInputSerializer(serializers.Serializer):
    ''' Serializer: Set input schema for operation. '''
    layout = LayoutSerializer()
    target = PKField(many=False, queryset=Operation.objects.all())
    input = PKField(
        many=False,
        queryset=LibraryItem.objects.filter(item_type=LibraryItemType.RSFORM),
        allow_null=True,
        default=None
    )

    def validate(self, attrs):
        oss = cast(LibraryItem, self.context['oss'])
        operation = cast(Operation, attrs['target'])
        if oss and operation.oss_id != oss.pk:
            raise serializers.ValidationError({
                'target': msg.operationNotInOSS()
            })
        if operation.operation_type != OperationType.INPUT:
            raise serializers.ValidationError({
                'target': msg.operationNotInput(operation.alias)
            })
        return attrs


class OperationSchemaSerializer(serializers.ModelSerializer):
    ''' Serializer: Detailed data for OSS. '''
    operations = serializers.ListField(
        child=OperationSerializer()
    )
    blocks = serializers.ListField(
        child=BlockSerializer()
    )
    arguments = serializers.ListField(
        child=ArgumentSerializer()
    )
    substitutions = serializers.ListField(
        child=SubstitutionExSerializer()
    )
    layout = LayoutSerializer()

    class Meta:
        ''' serializer metadata. '''
        model = LibraryItem
        fields = '__all__'

    def to_representation(self, instance: LibraryItem):
        result = LibraryItemDetailsSerializer(instance).data
        del result['versions']
        oss = OperationSchema(instance)
        result['layout'] = oss.layout().data
        result['operations'] = []
        result['blocks'] = []
        result['arguments'] = []
        result['substitutions'] = []
        for operation in oss.operations().order_by('pk'):
            result['operations'].append(OperationSerializer(operation).data)
        for block in oss.blocks().order_by('pk'):
            result['blocks'].append(BlockSerializer(block).data)
        for argument in oss.arguments().order_by('order'):
            result['arguments'].append(ArgumentSerializer(argument).data)
        for substitution in oss.substitutions().values(
            'operation',
            'original',
            'substitution',
            original_alias=F('original__alias'),
            original_term=F('original__term_resolved'),
            substitution_alias=F('substitution__alias'),
            substitution_term=F('substitution__term_resolved'),
        ).order_by('pk'):
            result['substitutions'].append(substitution)
        return result


class RelocateConstituentsSerializer(serializers.Serializer):
    ''' Serializer: Relocate constituents. '''
    destination = PKField(
        many=False,
        queryset=LibraryItem.objects.all().only('id')
    )
    items = PKField(
        many=True,
        allow_empty=False,
        queryset=Constituenta.objects.all()
    )

    def validate(self, attrs):
        attrs['destination'] = attrs['destination'].id
        attrs['source'] = attrs['items'][0].schema_id

        # TODO: check permissions for editing source and destination

        if attrs['source'] == attrs['destination']:
            raise serializers.ValidationError({
                'destination': msg.sourceEqualDestination()
            })
        for cst in attrs['items']:
            if cst.schema_id != attrs['source']:
                raise serializers.ValidationError({
                    f'{cst.pk}': msg.constituentaNotInRSform(attrs['items'][0].schema.title)
                })
        if Inheritance.objects.filter(child__in=attrs['items']).exists():
            raise serializers.ValidationError({
                'items': msg.RelocatingInherited()
            })

        oss = LibraryItem.objects \
            .filter(operations__result_id=attrs['destination']) \
            .filter(operations__result_id=attrs['source']).only('id')
        if not oss.exists():
            raise serializers.ValidationError({
                'destination': msg.schemasNotConnected()
            })
        attrs['oss'] = oss[0].pk

        if Argument.objects.filter(
            operation__result_id=attrs['destination'],
            argument__result_id=attrs['source']
        ).exists():
            attrs['move_down'] = True
        elif Argument.objects.filter(
            operation__result_id=attrs['source'],
            argument__result_id=attrs['destination']
        ).exists():
            attrs['move_down'] = False
        else:
            raise serializers.ValidationError({
                'destination': msg.schemasNotConnected()
            })

        return attrs
