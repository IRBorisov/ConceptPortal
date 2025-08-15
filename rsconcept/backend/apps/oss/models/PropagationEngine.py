''' Models: Change propagation engine. '''
from typing import Optional

from rest_framework.serializers import ValidationError

from apps.rsform.models import INSERT_LAST, Association, Constituenta, CstType, RSFormCached

from .Inheritance import Inheritance
from .Operation import Operation
from .OssCache import OssCache
from .Substitution import Substitution
from .utils import (
    CstMapping,
    CstSubstitution,
    create_dependant_mapping,
    cst_mapping_to_alias,
    map_cst_update_data
)


class PropagationEngine:
    ''' OSS changes propagation engine. '''

    def __init__(self, cache: OssCache):
        self.cache = cache

    def on_change_cst_type(self, operation_id: int, cst_id: int, ctype: CstType) -> None:
        ''' Trigger cascade resolutions when Constituenta type is changed. '''
        children = self.cache.extend_graph.outputs[operation_id]
        if not children:
            return
        self.cache.ensure_loaded_subs()
        for child_id in children:
            child_operation = self.cache.operation_by_id[child_id]
            successor_id = self.cache.get_inheritor(cst_id, child_id)
            if successor_id is None:
                continue
            child_schema = self.cache.get_schema(child_operation)
            if child_schema is None:
                continue
            if child_schema.change_cst_type(successor_id, ctype):
                self.on_change_cst_type(child_id, successor_id, ctype)

    # pylint: disable=too-many-arguments, too-many-positional-arguments
    def on_inherit_cst(
        self,
        target_operation: int,
        source: RSFormCached,
        items: list[Constituenta],
        mapping: CstMapping,
        exclude: Optional[list[int]] = None
    ) -> None:
        ''' Trigger cascade resolutions when Constituenta is inherited. '''
        children = self.cache.extend_graph.outputs[target_operation]
        if not children:
            return
        for child_id in children:
            if not exclude or child_id not in exclude:
                self.inherit_cst(child_id, source, items, mapping)

    def inherit_cst(
        self,
        target_operation: int,
        source: RSFormCached,
        items: list[Constituenta],
        mapping: CstMapping
    ) -> None:
        ''' Execute inheritance of Constituenta. '''
        operation = self.cache.operation_by_id[target_operation]
        destination = self.cache.get_schema(operation)
        if destination is None:
            return

        self.cache.ensure_loaded_subs()
        new_mapping = self._transform_mapping(mapping, operation, destination)
        alias_mapping = cst_mapping_to_alias(new_mapping)
        insert_where = self._determine_insert_position(items[0].pk, operation, source, destination)
        new_cst_list = destination.insert_copy(items, insert_where, alias_mapping)
        for index, cst in enumerate(new_cst_list):
            new_inheritance = Inheritance.objects.create(
                operation=operation,
                child=cst,
                parent=items[index]
            )
            self.cache.insert_inheritance(new_inheritance)
        new_mapping = {alias_mapping[alias]: cst for alias, cst in new_mapping.items()}
        self.on_inherit_cst(operation.pk, destination, new_cst_list, new_mapping)

    # pylint: disable=too-many-arguments, too-many-positional-arguments
    def on_update_cst(
        self,
        operation: int,
        cst_id: int,
        data: dict, old_data: dict,
        mapping: CstMapping
    ) -> None:
        ''' Trigger cascade resolutions when Constituenta data is changed. '''
        children = self.cache.extend_graph.outputs[operation]
        if not children:
            return
        self.cache.ensure_loaded_subs()
        for child_id in children:
            child_operation = self.cache.operation_by_id[child_id]
            successor_id = self.cache.get_inheritor(cst_id, child_id)
            if successor_id is None:
                continue
            child_schema = self.cache.get_schema(child_operation)
            assert child_schema is not None
            new_mapping = self._transform_mapping(mapping, child_operation, child_schema)
            alias_mapping = cst_mapping_to_alias(new_mapping)
            successor = child_schema.cache.by_id.get(successor_id)
            if successor is None:
                continue
            new_data = map_cst_update_data(successor, data, old_data, alias_mapping)
            if not new_data:
                continue
            new_old_data = child_schema.update_cst(successor.pk, new_data)
            if not new_old_data:
                continue
            new_mapping = {alias_mapping[alias]: cst for alias, cst in new_mapping.items()}
            self.on_update_cst(
                operation=child_id,
                cst_id=successor_id,
                data=new_data,
                old_data=new_old_data,
                mapping=new_mapping
            )

    def on_inherit_association(self, operationID: int,
                               items: list[Association],
                               exclude: Optional[list[int]] = None) -> None:
        ''' Trigger cascade resolutions when association is inherited. '''
        children = self.cache.extend_graph.outputs[operationID]
        if not children:
            return
        for child_id in children:
            if not exclude or child_id not in exclude:
                self.inherit_association(child_id, items)

    def inherit_association(self, target: int, items: list[Association]) -> None:
        ''' Execute inheritance of Associations. '''
        operation = self.cache.operation_by_id[target]
        if operation.result is None or not items:
            return

        self.cache.ensure_loaded_subs()

        existing_associations = set(
            Association.objects.filter(
                container__schema_id=operation.result_id,
            ).values_list('container_id', 'associate_id')
        )

        new_associations: list[Association] = []
        for assoc in items:
            new_container = self.cache.get_inheritor(assoc.container_id, target)
            new_associate = self.cache.get_inheritor(assoc.associate_id, target)
            if new_container is None or new_associate is None \
                    or new_associate == new_container \
                    or (new_container, new_associate) in existing_associations:
                continue

            new_associations.append(Association(
                container_id=new_container,
                associate_id=new_associate
            ))
        if new_associations:
            new_associations = Association.objects.bulk_create(new_associations)
            self.on_inherit_association(target, new_associations)

    def on_before_substitute(self, operationID: int, substitutions: CstSubstitution) -> None:
        ''' Trigger cascade resolutions when Constituenta substitution is executed. '''
        children = self.cache.extend_graph.outputs[operationID]
        if not children:
            return
        self.cache.ensure_loaded_subs()
        for child_id in children:
            child_operation = self.cache.operation_by_id[child_id]
            child_schema = self.cache.get_schema(child_operation)
            if child_schema is None:
                continue
            new_substitutions = self._transform_substitutions(substitutions, child_id, child_schema)
            if not new_substitutions:
                continue
            self.on_before_substitute(child_operation.pk, new_substitutions)
            child_schema.substitute(new_substitutions)

    def on_delete_association(self, operationID: int, associations: list[Association]) -> None:
        ''' Trigger cascade resolutions when association is deleted. '''
        children = self.cache.extend_graph.outputs[operationID]
        if not children:
            return
        self.cache.ensure_loaded_subs()
        for child_id in children:
            child_operation = self.cache.operation_by_id[child_id]
            child_schema = self.cache.get_schema(child_operation)
            if child_schema is None:
                continue

            deleted: list[Association] = []
            for assoc in associations:
                new_container = self.cache.get_inheritor(assoc.container_id, child_id)
                new_associate = self.cache.get_inheritor(assoc.associate_id, child_id)
                if new_container is None or new_associate is None:
                    continue
                deleted_assoc = Association.objects.filter(
                    container=new_container,
                    associate=new_associate
                )
                if deleted_assoc.exists():
                    deleted.append(deleted_assoc[0])
            if deleted:
                self.on_delete_association(child_id, deleted)
                Association.objects.filter(pk__in=[assoc.pk for assoc in deleted]).delete()

    def on_delete_inherited(self, operation: int, target: list[int]) -> None:
        ''' Trigger cascade resolutions when Constituenta inheritance is deleted. '''
        children = self.cache.extend_graph.outputs[operation]
        if not children:
            return
        self.cache.ensure_loaded_subs()
        for child_id in children:
            self.delete_inherited(child_id, target)

    def delete_inherited(self, operation_id: int, parent_ids: list[int]) -> None:
        ''' Execute deletion of Constituenta inheritance. '''
        operation = self.cache.operation_by_id[operation_id]
        schema = self.cache.get_schema(operation)
        if schema is None:
            return
        self.undo_substitutions_cst(parent_ids, operation, schema)
        target_ids = self.cache.get_inheritors_list(parent_ids, operation_id)
        self.on_delete_inherited(operation_id, target_ids)
        if target_ids:
            self.cache.remove_cst(operation_id, target_ids)
            schema.delete_cst(target_ids)

    def undo_substitutions_cst(self, target_ids: list[int], operation: Operation, schema: RSFormCached) -> None:
        ''' Undo substitutions for Constituents. '''
        to_process = []
        for sub in self.cache.substitutions[operation.pk]:
            if sub.original_id in target_ids or sub.substitution_id in target_ids:
                to_process.append(sub)
        for sub in to_process:
            self.undo_substitution(schema, sub, target_ids)

    def undo_substitution(
        self,
        schema: RSFormCached,
        target: Substitution,
        ignore_parents: Optional[list[int]] = None
    ) -> None:
        ''' Undo target substitution. '''
        if ignore_parents is None:
            ignore_parents = []
        operation_id = target.operation_id
        original_schema = self.cache.get_schema_by_id(target.original.schema_id)
        dependant = []
        for cst_id in original_schema.get_dependant([target.original_id]):
            if cst_id not in ignore_parents:
                inheritor_id = self.cache.get_inheritor(cst_id, operation_id)
                if inheritor_id is not None:
                    dependant.append(inheritor_id)

        self.cache.substitutions[operation_id].remove(target)
        target.delete()

        new_original: Optional[Constituenta] = None
        if target.original_id not in ignore_parents:
            full_cst = Constituenta.objects.get(pk=target.original_id)
            cst_mapping = create_dependant_mapping(original_schema, [full_cst])
            self.inherit_cst(operation_id, original_schema, [full_cst], cst_mapping)
            new_original_id = self.cache.get_inheritor(target.original_id, operation_id)
            assert new_original_id is not None
            new_original = schema.cache.by_id[new_original_id]

        if dependant:
            substitution_id = self.cache.get_inheritor(target.substitution_id, operation_id)
            assert substitution_id is not None
            substitution_inheritor = schema.cache.by_id[substitution_id]
            mapping = {substitution_inheritor.alias: new_original}
            self._on_partial_mapping(mapping, dependant, operation_id, schema)

    def _determine_insert_position(
        self, prototype_id: int,
        operation: Operation,
        source: RSFormCached,
        destination: RSFormCached
    ) -> int:
        ''' Determine insert_after for new constituenta. '''
        prototype = source.cache.by_id[prototype_id]
        prototype_index = source.cache.constituents.index(prototype)
        if prototype_index == 0:
            return 0
        prev_cst = source.cache.constituents[prototype_index - 1]
        inherited_prev_id = self.cache.get_successor(prev_cst.pk, operation.pk)
        if inherited_prev_id is None:
            return INSERT_LAST
        prev_cst = destination.cache.by_id[inherited_prev_id]
        prev_index = destination.cache.constituents.index(prev_cst)
        return prev_index + 1

    def _transform_mapping(self, mapping: CstMapping, operation: Operation, schema: RSFormCached) -> CstMapping:
        if not mapping:
            return mapping
        result: CstMapping = {}
        for alias, cst in mapping.items():
            if cst is None:
                result[alias] = None
                continue
            successor_id = self.cache.get_successor(cst.pk, operation.pk)
            if successor_id is None:
                continue
            successor = schema.cache.by_id.get(successor_id)
            if successor is None:
                continue
            result[alias] = successor
        return result

    def _transform_substitutions(
        self,
        target: CstSubstitution,
        operation: int,
        schema: RSFormCached
    ) -> CstSubstitution:
        result: CstSubstitution = []
        for current_sub in target:
            sub_replaced = False
            new_substitution_id = self.cache.get_inheritor(current_sub[1].pk, operation)
            if new_substitution_id is None:
                for sub in self.cache.substitutions[operation]:
                    if sub.original_id == current_sub[1].pk:
                        sub_replaced = True
                        new_substitution_id = self.cache.get_inheritor(sub.original_id, operation)
                        break

            new_original_id = self.cache.get_inheritor(current_sub[0].pk, operation)
            original_replaced = False
            if new_original_id is None:
                for sub in self.cache.substitutions[operation]:
                    if sub.original_id == current_sub[0].pk:
                        original_replaced = True
                        sub.original_id = current_sub[1].pk
                        sub.save()
                        new_original_id = new_substitution_id
                        new_substitution_id = self.cache.get_inheritor(sub.substitution_id, operation)
                        break

            if sub_replaced and original_replaced:
                raise ValidationError({'propagation': 'Substitution breaks OSS substitutions.'})

            for sub in self.cache.substitutions[operation]:
                if sub.substitution_id == current_sub[0].pk:
                    sub.substitution_id = current_sub[1].pk
                    sub.save()

            if new_original_id is not None and new_substitution_id is not None:
                result.append((schema.cache.by_id[new_original_id], schema.cache.by_id[new_substitution_id]))
        return result

    def _on_partial_mapping(
        self,
        mapping: CstMapping,
        target: list[int],
        operation: int,
        schema: RSFormCached
    ) -> None:
        ''' Trigger cascade resolutions when Constituents are partially mapped. '''
        alias_mapping = cst_mapping_to_alias(mapping)
        schema.apply_partial_mapping(alias_mapping, target)
        children = self.cache.extend_graph.outputs[operation]
        if not children:
            return
        self.cache.ensure_loaded_subs()
        for child_id in children:
            child_operation = self.cache.operation_by_id[child_id]
            child_schema = self.cache.get_schema(child_operation)
            if child_schema is None:
                continue
            new_mapping = self._transform_mapping(mapping, child_operation, child_schema)
            if not new_mapping:
                continue
            new_target = self.cache.get_inheritors_list(target, child_id)
            if not new_target:
                continue
            self._on_partial_mapping(new_mapping, new_target, child_id, child_schema)
