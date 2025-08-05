''' Models: OSS API. '''

from typing import Optional

from apps.rsform.graph import Graph
from apps.rsform.models import RSFormCached

from .Argument import Argument
from .Inheritance import Inheritance
from .Operation import Operation, OperationType
from .Reference import Reference
from .Substitution import Substitution


class OssCache:
    ''' Cache for OSS data. '''

    def __init__(self, item_id: int):
        self._item_id = item_id
        self._schemas: list[RSFormCached] = []
        self._schema_by_id: dict[int, RSFormCached] = {}

        self.operations = list(Operation.objects.filter(oss_id=item_id).only('result_id', 'operation_type'))
        self.operation_by_id = {operation.pk: operation for operation in self.operations}
        self.graph = Graph[int]()
        self.extend_graph = Graph[int]()
        for operation in self.operations:
            self.graph.add_node(operation.pk)
            self.extend_graph.add_node(operation.pk)

        references = Reference.objects.filter(reference__oss_id=self._item_id).only('reference_id', 'target_id')
        self.reference_target = {ref.reference_id: ref.target_id for ref in references}
        arguments = Argument.objects \
            .filter(operation__oss_id=self._item_id) \
            .only('operation_id', 'argument_id') \
            .order_by('order')
        for argument in arguments:
            self.graph.add_edge(argument.argument_id, argument.operation_id)
            self.extend_graph.add_edge(argument.argument_id, argument.operation_id)
            target = self.reference_target.get(argument.argument_id)
            if target is not None:
                self.extend_graph.add_edge(target, argument.operation_id)

        self.is_loaded_subs = False
        self.substitutions: dict[int, list[Substitution]] = {}
        self.inheritance: dict[int, list[Inheritance]] = {}

    def ensure_loaded_subs(self) -> None:
        ''' Ensure cache is fully loaded. '''
        if self.is_loaded_subs:
            return
        self.is_loaded_subs = True
        for operation in self.operations:
            self.inheritance[operation.pk] = []
            self.substitutions[operation.pk] = []
        for sub in Substitution.objects.filter(operation__oss_id=self._item_id).only(
                'operation_id', 'original_id', 'substitution_id', 'original__schema_id'):
            self.substitutions[sub.operation_id].append(sub)
        for item in Inheritance.objects.filter(operation__oss_id=self._item_id).only(
                'operation_id', 'parent_id', 'child_id'):
            self.inheritance[item.operation_id].append(item)

    def get_schema(self, operation: Operation) -> Optional[RSFormCached]:
        ''' Get schema by Operation. '''
        if operation.result_id is None:
            return None
        if operation.result_id in self._schema_by_id:
            return self._schema_by_id[operation.result_id]
        else:
            schema = RSFormCached.from_id(operation.result_id)
            schema.cache.ensure_loaded()
            self._insert_new(schema)
            return schema

    def get_schema_by_id(self, target: int) -> RSFormCached:
        ''' Get schema by Operation. '''
        if target in self._schema_by_id:
            return self._schema_by_id[target]
        else:
            schema = RSFormCached.from_id(target)
            schema.cache.ensure_loaded()
            self._insert_new(schema)
            return schema

    def get_operation(self, schemaID: int) -> Operation:
        ''' Get operation by schema. '''
        for operation in self.operations:
            if operation.result_id == schemaID and operation.operation_type != OperationType.REFERENCE:
                return operation
        raise ValueError(f'Operation for schema {schemaID} not found')

    def get_inheritor(self, parent_cst: int, operation: int) -> Optional[int]:
        ''' Get child for parent inside target RSFrom. '''
        for item in self.inheritance[operation]:
            if item.parent_id == parent_cst:
                return item.child_id
        return None

    def get_inheritors_list(self, target: list[int], operation: int) -> list[int]:
        ''' Get child for parent inside target RSFrom. '''
        result = []
        for item in self.inheritance[operation]:
            if item.parent_id in target:
                result.append(item.child_id)
        return result

    def get_successor(self, parent_cst: int, operation: int) -> Optional[int]:
        ''' Get child for parent inside target RSFrom including substitutions. '''
        for sub in self.substitutions[operation]:
            if sub.original_id == parent_cst:
                return self.get_inheritor(sub.substitution_id, operation)
        return self.get_inheritor(parent_cst, operation)

    def insert_schema(self, schema: RSFormCached) -> None:
        ''' Insert new schema. '''
        if not self._schema_by_id.get(schema.model.pk):
            schema.cache.ensure_loaded()
            self._insert_new(schema)

    def insert_argument(self, argument: Argument) -> None:
        ''' Insert new argument. '''
        self.graph.add_edge(argument.argument_id, argument.operation_id)
        self.extend_graph.add_edge(argument.argument_id, argument.operation_id)
        target = self.reference_target.get(argument.argument_id)
        if target is not None:
            self.extend_graph.add_edge(target, argument.operation_id)

    def insert_inheritance(self, inheritance: Inheritance) -> None:
        ''' Insert new inheritance. '''
        self.inheritance[inheritance.operation_id].append(inheritance)

    def insert_substitution(self, sub: Substitution) -> None:
        ''' Insert new substitution. '''
        self.substitutions[sub.operation_id].append(sub)

    def remove_cst(self, operation: int, target: list[int]) -> None:
        ''' Remove constituents from operation. '''
        subs_to_delete = [
            sub for sub in self.substitutions[operation]
            if sub.original_id in target or sub.substitution_id in target
        ]
        for sub in subs_to_delete:
            self.substitutions[operation].remove(sub)
        inherit_to_delete = [item for item in self.inheritance[operation] if item.child_id in target]
        for item in inherit_to_delete:
            self.inheritance[operation].remove(item)

    def remove_schema(self, schema: RSFormCached) -> None:
        ''' Remove schema from cache. '''
        self._schemas.remove(schema)
        del self._schema_by_id[schema.model.pk]

    def remove_operation(self, operation: int) -> None:
        ''' Remove operation from cache. '''
        target = self.operation_by_id[operation]
        self.graph.remove_node(operation)
        self.extend_graph.remove_node(operation)
        if target.result_id in self._schema_by_id:
            self._schemas.remove(self._schema_by_id[target.result_id])
            del self._schema_by_id[target.result_id]
        self.operations.remove(self.operation_by_id[operation])
        del self.operation_by_id[operation]
        if operation in self.reference_target:
            del self.reference_target[operation]
        if self.is_loaded_subs:
            del self.substitutions[operation]
            del self.inheritance[operation]

    def remove_argument(self, argument: Argument) -> None:
        ''' Remove argument from cache. '''
        self.graph.remove_edge(argument.argument_id, argument.operation_id)
        self.extend_graph.remove_edge(argument.argument_id, argument.operation_id)
        target = self.reference_target.get(argument.argument_id)
        if target is not None:
            if not Argument.objects.filter(argument_id=target, operation_id=argument.operation_id).exists():
                self.extend_graph.remove_edge(target, argument.operation_id)

    def remove_substitution(self, target: Substitution) -> None:
        ''' Remove substitution from cache. '''
        self.substitutions[target.operation_id].remove(target)

    def remove_inheritance(self, target: Inheritance) -> None:
        ''' Remove inheritance from cache. '''
        self.inheritance[target.operation_id].remove(target)

    def _insert_new(self, schema: RSFormCached) -> None:
        self._schemas.append(schema)
        self._schema_by_id[schema.model.pk] = schema
