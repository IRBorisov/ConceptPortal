''' Models: Change propagation manager. '''
from typing import Optional, cast

from cctext import extract_entities

from apps.library.models import LibraryItem
from apps.rsform.graph import Graph
from apps.rsform.models import (
    INSERT_LAST,
    Constituenta,
    CstType,
    RSForm,
    extract_globals,
    replace_entities,
    replace_globals
)

from .Inheritance import Inheritance
from .Operation import Operation
from .OperationSchema import OperationSchema
from .Substitution import Substitution

CstMapping = dict[str, Constituenta]

# TODO: add more variety tests for cascade resolutions model


class ChangeManager:
    ''' Change propagation wrapper for OSS. '''
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

        def get_operation(self, schema: RSForm) -> Operation:
            ''' Get operation by schema. '''
            for operation in self.operations:
                if operation.result_id == schema.model.pk:
                    return operation
            raise ValueError(f'Operation for schema {schema.model.pk} not found')

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

        def get_successor_for(
            self,
            parent_cst: int,
            operation: int,
            ignore_substitution: bool = False
        ) -> Optional[int]:
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

        def remove_cst(self, target: list[int], operation: int) -> None:
            ''' Remove constituents from operation. '''
            subs = [sub for sub in self.substitutions if sub.original_id in target or sub.substitution_id in target]
            for sub in subs:
                self.substitutions.remove(sub)
            to_delete = [item for item in self.inheritance[operation] if item[1] in target]
            for item in to_delete:
                self.inheritance[operation].remove(item)

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
        alias_mapping: CstMapping = {}
        for alias in depend_aliases:
            cst = source.cache.by_alias.get(alias)
            if cst is not None:
                alias_mapping[alias] = cst
        operation = self.cache.get_operation(source)
        self._cascade_create_cst(new_cst, operation, alias_mapping)

    def on_change_cst_type(self, target: Constituenta, source: RSForm) -> None:
        ''' Trigger cascade resolutions when constituenta type is changed. '''
        self.cache.insert(source)
        operation = self.cache.get_operation(source)
        self._cascade_change_cst_type(target.pk, target.cst_type, operation)

    def on_update_cst(self, target: Constituenta, data: dict, old_data: dict, source: RSForm) -> None:
        ''' Trigger cascade resolutions when constituenta data is changed. '''
        self.cache.insert(source)
        operation = self.cache.get_operation(source)
        depend_aliases = self._extract_data_references(data, old_data)
        alias_mapping: CstMapping = {}
        for alias in depend_aliases:
            cst = source.cache.by_alias.get(alias)
            if cst is not None:
                alias_mapping[alias] = cst
        self._cascade_update_cst(target.pk, operation, data, old_data, alias_mapping)

    def before_delete(self, target: list[Constituenta], source: RSForm) -> None:
        ''' Trigger cascade resolutions before constituents are deleted. '''
        self.cache.insert(source)
        operation = self.cache.get_operation(source)
        self._cascade_before_delete(target, operation)

    def _cascade_before_delete(self, target: list[Constituenta], operation: Operation) -> None:
        children = self.cache.graph.outputs[operation.pk]
        if len(children) == 0:
            return
        self.cache.ensure_loaded()
        for child_id in children:
            child_operation = self.cache.operation_by_id[child_id]
            child_schema = self.cache.get_schema(child_operation)
            if child_schema is None:
                continue
            child_schema.cache.ensure_loaded()

            # TODO: check if substitutions are affected. Undo substitutions before deletion

            child_target_cst = []
            child_target_ids = []
            for cst in target:
                successor_id = self.cache.get_successor_for(cst.pk, child_id, ignore_substitution=True)
                if successor_id is not None:
                    child_target_ids.append(successor_id)
                    child_target_cst.append(child_schema.cache.by_id[successor_id])
            self._cascade_before_delete(child_target_cst, child_operation)
            self.cache.remove_cst(child_target_ids, child_id)
            child_schema.delete_cst(child_target_cst)

    def _cascade_create_cst(self, prototype: Constituenta, operation: Operation, mapping: CstMapping) -> None:
        children = self.cache.graph.outputs[operation.pk]
        if len(children) == 0:
            return
        source_schema = self.cache.get_schema(operation)
        assert source_schema is not None
        for child_id in children:
            child_operation = self.cache.operation_by_id[child_id]
            child_schema = self.cache.get_schema(child_operation)
            if child_schema is None:
                continue

            # TODO: update substitutions for diamond synthesis (if needed)

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
            self._cascade_create_cst(new_cst, child_operation, new_mapping)

    def _cascade_change_cst_type(self, cst_id: int, ctype: CstType, operation: Operation) -> None:
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
                self._cascade_change_cst_type(successor_id, ctype, child_operation)

    # pylint: disable=too-many-arguments
    def _cascade_update_cst(
        self,
        cst_id: int, operation: Operation,
        data: dict, old_data: dict,
        mapping: CstMapping
    ) -> None:
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
            assert child_schema is not None
            new_mapping = self._transform_mapping(mapping, child_operation, child_schema)
            alias_mapping = {alias: cst.alias for alias, cst in new_mapping.items()}
            successor = child_schema.cache.by_id.get(successor_id)
            if successor is None:
                continue
            new_data = self._prepare_update_data(successor, data, old_data, alias_mapping)
            if len(new_data) == 0:
                continue
            new_old_data = child_schema.update_cst(successor, new_data)
            if len(new_old_data) == 0:
                continue
            new_mapping = {alias_mapping[alias]: cst for alias, cst in new_mapping.items()}
            self._cascade_update_cst(successor_id, child_operation, new_data, new_old_data, new_mapping)

    def _transform_mapping(self, mapping: CstMapping, operation: Operation, schema: RSForm) -> CstMapping:
        if len(mapping) == 0:
            return mapping
        result: CstMapping = {}
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

    def _extract_data_references(self, data: dict, old_data: dict) -> set[str]:
        result: set[str] = set()
        if 'definition_formal' in data:
            result.update(extract_globals(data['definition_formal']))
            result.update(extract_globals(old_data['definition_formal']))
        if 'term_raw' in data:
            result.update(extract_entities(data['term_raw']))
            result.update(extract_entities(old_data['term_raw']))
        if 'definition_raw' in data:
            result.update(extract_entities(data['definition_raw']))
            result.update(extract_entities(old_data['definition_raw']))
        return result

    def _prepare_update_data(self, cst: Constituenta, data: dict, old_data: dict, mapping: dict[str, str]) -> dict:
        new_data = {}
        if 'term_forms' in data:
            if old_data['term_forms'] == cst.term_forms:
                new_data['term_forms'] = data['term_forms']
        if 'convention' in data:
            if old_data['convention'] == cst.convention:
                new_data['convention'] = data['convention']
        if 'definition_formal' in data:
            new_data['definition_formal'] = replace_globals(data['definition_formal'], mapping)
        if 'term_raw' in data:
            if replace_entities(old_data['term_raw'], mapping) == cst.term_raw:
                new_data['term_raw'] = replace_entities(data['term_raw'], mapping)
        if 'definition_raw' in data:
            if replace_entities(old_data['definition_raw'], mapping) == cst.definition_raw:
                new_data['definition_raw'] = replace_entities(data['definition_raw'], mapping)
        return new_data
