''' Models: Change propagation manager. '''
from typing import Optional, cast

from apps.library.models import LibraryItem
from apps.rsform.graph import Graph
from apps.rsform.models import INSERT_LAST, Constituenta, CstType, RSForm

from .Inheritance import Inheritance
from .Operation import Operation
from .OperationSchema import OperationSchema
from .Substitution import Substitution

AliasMapping = dict[str, Constituenta]

# TODO: add more variety tests for cascade resolutions model


class ChangeManager:
    ''' Change propagation API. '''
    class Cache:
        ''' Cache for RSForm constituents. '''

        def __init__(self, oss: OperationSchema):
            self._oss = oss
            self._schemas: list[RSForm] = []
            self._schema_by_id: dict[int, RSForm] = {}

            self.operations = list(oss.operations().only('result_id'))
            self.operation_by_id = {operation.pk: operation for operation in self.operations}
            self.graph = Graph[int]()
            for operation in self.operations:
                self.graph.add_node(operation.pk)
            for argument in self._oss.arguments().only('operation_id', 'argument_id'):
                self.graph.add_edge(argument.argument_id, argument.operation_id)

            self.is_loaded = False
            self.substitutions: list[Substitution] = []
            self.inheritance: dict[int, list[tuple[int, int]]] = {}

        def insert(self, schema: RSForm) -> None:
            ''' Insert new schema. '''
            if not self._schema_by_id.get(schema.model.pk):
                self._insert_new(schema)

        def get_schema(self, operation: Operation) -> Optional[RSForm]:
            ''' Get schema by Operation. '''
            if operation.result_id is None:
                return None
            if operation.result_id in self._schema_by_id:
                return self._schema_by_id[operation.result_id]
            else:
                schema = RSForm.from_id(operation.result_id)
                schema.cache.ensure_loaded()
                self._insert_new(schema)
                return schema

        def get_operation(self, schema: RSForm) -> Optional[Operation]:
            ''' Get operation by schema. '''
            for operation in self.operations:
                if operation.result_id == schema.model.pk:
                    return operation
            return None

        def ensure_loaded(self) -> None:
            ''' Ensure propagation of changes. '''
            if self.is_loaded:
                return
            self.is_loaded = True
            self.substitutions = list(self._oss.substitutions().only('operation_id', 'original_id', 'substitution_id'))
            for operation in self.operations:
                self.inheritance[operation.pk] = []
            for item in self._oss.inheritance().only('operation_id', 'parent_id', 'child_id'):
                self.inheritance[item.operation_id].append((item.parent_id, item.child_id))

        def get_successor_for(self, parent_cst: int, operation: int,
                              ignore_substitution: bool = False) -> Optional[int]:
            ''' Get child for parent inside target RSFrom. '''
            if not ignore_substitution:
                for sub in self.substitutions:
                    if sub.operation_id == operation and sub.original_id == parent_cst:
                        return sub.substitution_id
            for item in self.inheritance[operation]:
                if item[0] == parent_cst:
                    return item[1]
            return None

        def insert_inheritance(self, inheritance: Inheritance) -> None:
            ''' Insert new inheritance. '''
            self.inheritance[inheritance.operation_id].append((inheritance.parent_id, inheritance.child_id))

        def _insert_new(self, schema: RSForm) -> None:
            self._schemas.append(schema)
            self._schema_by_id[schema.model.pk] = schema


    def __init__(self, model: LibraryItem):
        self.oss = OperationSchema(model)
        self.cache = ChangeManager.Cache(self.oss)


    def on_create_cst(self, new_cst: Constituenta, source: RSForm) -> None:
        ''' Trigger cascade resolutions when new constituent is created. '''
        self.cache.insert(source)
        depend_aliases = new_cst.extract_references()
        alias_mapping: AliasMapping = {}
        for alias in depend_aliases:
            cst = source.cache.by_alias.get(alias)
            if cst is not None:
                alias_mapping[alias] = cst
        operation = self.cache.get_operation(source)
        if operation is None:
            return
        self._create_cst_cascade(new_cst, operation, alias_mapping)

    def on_change_cst_type(self, target: Constituenta, source: RSForm) -> None:
        ''' Trigger cascade resolutions when new constituent type is changed. '''
        self.cache.insert(source)
        operation = self.cache.get_operation(source)
        if operation is None:
            return
        self._change_cst_type_cascade(target.pk, target.cst_type, operation)

    def _change_cst_type_cascade(self, cst_id: int, ctype: CstType, operation: Operation) -> None:
        children = self.cache.graph.outputs[operation.pk]
        if len(children) == 0:
            return
        self.cache.ensure_loaded()
        for child_id in children:
            child_operation = self.cache.operation_by_id[child_id]
            successor_id = self.cache.get_successor_for(cst_id, child_id, ignore_substitution=True)
            if successor_id is None:
                continue
            child_schema = self.cache.get_schema(child_operation)
            if child_schema is not None and child_schema.change_cst_type(successor_id, ctype):
                self._change_cst_type_cascade(successor_id, ctype, child_operation)


    def _create_cst_cascade(self, prototype: Constituenta, source: Operation, mapping: AliasMapping) -> None:
        children = self.cache.graph.outputs[source.pk]
        if len(children) == 0:
            return
        source_schema = self.cache.get_schema(source)
        assert source_schema is not None
        for child_id in children:
            child_operation = self.cache.operation_by_id[child_id]
            child_schema = self.cache.get_schema(child_operation)
            if child_schema is None:
                continue

            self.cache.ensure_loaded()
            new_mapping = self._transform_mapping(mapping, child_operation, child_schema)
            alias_mapping = {alias: cst.alias for alias, cst in new_mapping.items()}
            insert_where = self._determine_insert_position(prototype, child_operation, source_schema, child_schema)
            new_cst = child_schema.insert_copy([prototype], insert_where, alias_mapping)[0]
            new_inheritance = Inheritance.objects.create(
                operation=child_operation,
                child=new_cst,
                parent=prototype
            )
            self.cache.insert_inheritance(new_inheritance)
            new_mapping = {alias_mapping[alias]: cst for alias, cst in new_mapping.items()}
            self._create_cst_cascade(new_cst, child_operation, new_mapping)


    def _transform_mapping(self, mapping: AliasMapping, operation: Operation, schema: RSForm) -> AliasMapping:
        if len(mapping) == 0:
            return mapping
        result: AliasMapping = {}
        for alias, cst in mapping.items():
            successor_id = self.cache.get_successor_for(cst.pk, operation.pk)
            if successor_id is None:
                continue
            successor = schema.cache.by_id.get(successor_id)
            if successor is None:
                continue
            result[alias] = successor
        return result

    def _determine_insert_position(
        self, prototype: Constituenta,
        operation: Operation,
        source: RSForm,
        destination: RSForm
    ) -> int:
        ''' Determine insert_after for new constituenta. '''
        if prototype.order == 1:
            return 1
        prev_cst = source.cache.constituents[prototype.order - 2]
        inherited_prev_id = self.cache.get_successor_for(
            source.cache.constituents[prototype.order - 2].pk, operation.pk)
        if inherited_prev_id is None:
            return INSERT_LAST
        prev_cst = destination.cache.by_id[inherited_prev_id]
        return cast(int, prev_cst.order) + 1
