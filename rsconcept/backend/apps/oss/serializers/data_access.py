''' Serializers for persistent data manipulation. '''
from collections import deque
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
from .basics import NodeSerializer, SubstitutionExSerializer


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

    layout = serializers.ListField(
        child=NodeSerializer()
    )
    item_data = BlockCreateData()
    width = serializers.FloatField()
    height = serializers.FloatField()
    position_x = serializers.FloatField()
    position_y = serializers.FloatField()
    children_operations = PKField(many=True, queryset=Operation.objects.all().only('oss_id'))
    children_blocks = PKField(many=True, queryset=Block.objects.all().only('oss_id'))

    def validate(self, attrs):
        oss = cast(LibraryItem, self.context['oss'])
        parent = attrs['item_data'].get('parent')
        children_blocks = attrs.get('children_blocks', [])

        if parent is not None and parent.oss_id != oss.pk:
            raise serializers.ValidationError({
                'parent': msg.parentNotInOSS()
            })

        for operation in attrs['children_operations']:
            if operation.oss_id != oss.pk:
                raise serializers.ValidationError({
                    'children_operations': msg.childNotInOSS()
                })

        for block in children_blocks:
            if block.oss_id != oss.pk:
                raise serializers.ValidationError({
                    'children_blocks': msg.childNotInOSS()
                })

        if parent:
            descendant_ids = _collect_descendants(children_blocks)
            if parent.pk in descendant_ids:
                raise serializers.ValidationError({'parent': msg.blockCyclicHierarchy()})

        return attrs


class UpdateBlockSerializer(serializers.Serializer):
    ''' Serializer: Block update. '''
    class UpdateBlockData(serializers.ModelSerializer):
        ''' Serializer: Block update data. '''
        class Meta:
            ''' serializer metadata. '''
            model = Block
            fields = 'title', 'description', 'parent'

    layout = serializers.ListField(
        child=NodeSerializer(),
        required=False
    )
    target = PKField(many=False, queryset=Block.objects.all())
    item_data = UpdateBlockData()

    def validate(self, attrs):
        oss = cast(LibraryItem, self.context['oss'])
        block = cast(Block, attrs['target'])
        if block.oss_id != oss.pk:
            raise serializers.ValidationError({
                'target': msg.blockNotInOSS()
            })

        parent = attrs['item_data'].get('parent')
        if parent is not None:
            if parent.oss_id != oss.pk:
                raise serializers.ValidationError({
                    'parent': msg.parentNotInOSS()
                })
            if parent == attrs['target']:
                raise serializers.ValidationError({
                    'parent': msg.blockCyclicHierarchy()
                })
        return attrs


class DeleteBlockSerializer(serializers.Serializer):
    ''' Serializer: Delete block. '''
    layout = serializers.ListField(
        child=NodeSerializer()
    )
    target = PKField(many=False, queryset=Block.objects.all().only('oss_id'))

    def validate(self, attrs):
        oss = cast(LibraryItem, self.context['oss'])
        block = cast(Block, attrs['target'])
        if block.oss_id != oss.pk:
            raise serializers.ValidationError({
                'target': msg.blockNotInOSS()
            })
        return attrs


class MoveItemsSerializer(serializers.Serializer):
    ''' Serializer: Move items to another parent. '''
    layout = serializers.ListField(
        child=NodeSerializer()
    )
    operations = PKField(many=True, queryset=Operation.objects.all().only('oss_id', 'parent'))
    blocks = PKField(many=True, queryset=Block.objects.all().only('oss_id', 'parent'))
    destination = PKField(many=False, queryset=Block.objects.all().only('oss_id'), allow_null=True)

    def validate(self, attrs):
        oss = cast(LibraryItem, self.context['oss'])
        parent_block = cast(Block, attrs['destination'])
        moved_blocks = attrs.get('blocks', [])
        moved_operations = attrs.get('operations', [])

        if parent_block is not None and parent_block.oss_id != oss.pk:
            raise serializers.ValidationError({
                'destination': msg.blockNotInOSS()
            })
        for operation in moved_operations:
            if operation.oss_id != oss.pk:
                raise serializers.ValidationError({
                    'operations': msg.operationNotInOSS()
                })
        for block in moved_blocks:
            if parent_block is not None and block.pk == parent_block.pk:
                raise serializers.ValidationError({
                    'destination': msg.blockCyclicHierarchy()
                })
            if block.oss_id != oss.pk:
                raise serializers.ValidationError({
                    'blocks': msg.blockNotInOSS()
                })

        if parent_block:
            ancestor_ids = _collect_ancestors(parent_block)
            moved_block_ids = {b.pk for b in moved_blocks}
            if moved_block_ids & ancestor_ids:
                raise serializers.ValidationError({
                    'destination': msg.blockCyclicHierarchy()
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

    layout = serializers.ListField(
        child=NodeSerializer()
    )
    item_data = CreateOperationData()
    width = serializers.FloatField()
    height = serializers.FloatField()
    position_x = serializers.FloatField()
    position_y = serializers.FloatField()
    create_schema = serializers.BooleanField(default=False, required=False)
    arguments = PKField(many=True, queryset=Operation.objects.all().only('pk'), required=False)

    def validate(self, attrs):
        oss = cast(LibraryItem, self.context['oss'])
        parent = attrs['item_data'].get('parent')
        if parent is not None and parent.oss_id != oss.pk:
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

    layout = serializers.ListField(
        child=NodeSerializer(),
        required=False
    )
    target = PKField(many=False, queryset=Operation.objects.all())
    item_data = UpdateOperationData()
    arguments = PKField(many=True, queryset=Operation.objects.all().only('oss_id', 'result_id'), required=False)
    substitutions = serializers.ListField(
        child=SubstitutionSerializerBase(),
        required=False
    )

    def validate(self, attrs):
        oss = cast(LibraryItem, self.context['oss'])
        parent = attrs['item_data'].get('parent')
        target = cast(Block, attrs['target'])
        if target.oss_id != oss.pk:
            raise serializers.ValidationError({
                'target': msg.operationNotInOSS()
            })

        if parent is not None and parent.oss_id != oss.pk:
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
    layout = serializers.ListField(
        child=NodeSerializer()
    )
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
    layout = serializers.ListField(
        child=NodeSerializer()
    )
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
    layout = serializers.ListField(
        child=NodeSerializer()
    )
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
    layout = serializers.ListField(
        child=NodeSerializer()
    )

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

# ====== Internals ============


def _collect_descendants(start_blocks: list[Block]) -> set[int]:
    """ Recursively collect all descendant block IDs from a list of blocks. """
    visited = set()
    queue = deque(start_blocks)
    while queue:
        block = queue.popleft()
        if block.pk not in visited:
            visited.add(block.pk)
            queue.extend(block.as_child_block.all())
    return visited


def _collect_ancestors(block: Block) -> set[int]:
    """ Recursively collect all ancestor block IDs of a block. """
    ancestors = set()
    current = block.parent
    while current:
        if current.pk in ancestors:
            break  # Prevent infinite loop in malformed data
        ancestors.add(current.pk)
        current = current.parent
    return ancestors
