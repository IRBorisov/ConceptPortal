''' Models: OSS API. '''
from typing import Optional, cast

from cctext import extract_entities
from django.db.models import QuerySet
from rest_framework.serializers import ValidationError

from apps.library.models import Editor, LibraryItem, LibraryItemType
from apps.rsform.graph import Graph
from apps.rsform.models import (
    DELETED_ALIAS,
    INSERT_LAST,
    Constituenta,
    CstType,
    RSForm,
    extract_globals,
    replace_entities,
    replace_globals
)

from .Argument import Argument
from .Inheritance import Inheritance
from .Operation import Operation
from .Substitution import Substitution

CstMapping = dict[str, Optional[Constituenta]]
CstSubstitution = list[tuple[Constituenta, Constituenta]]


class OperationSchema:
    ''' Operations schema API. '''

    def __init__(self, model: LibraryItem):
        self.model = model
        self.cache = OssCache(self)

    @staticmethod
    def create(**kwargs) -> 'OperationSchema':
        ''' Create LibraryItem via OperationSchema. '''
        model = LibraryItem.objects.create(item_type=LibraryItemType.OPERATION_SCHEMA, **kwargs)
        return OperationSchema(model)

    @staticmethod
    def from_id(pk: int) -> 'OperationSchema':
        ''' Get LibraryItem by pk. '''
        model = LibraryItem.objects.get(pk=pk)
        return OperationSchema(model)

    def save(self, *args, **kwargs) -> None:
        ''' Save wrapper. '''
        self.model.save(*args, **kwargs)

    def refresh_from_db(self) -> None:
        ''' Model wrapper. '''
        self.model.refresh_from_db()

    def operations(self) -> QuerySet[Operation]:
        ''' Get QuerySet containing all operations of current OSS. '''
        return Operation.objects.filter(oss=self.model)

    def arguments(self) -> QuerySet[Argument]:
        ''' Operation arguments. '''
        return Argument.objects.filter(operation__oss=self.model)

    def substitutions(self) -> QuerySet[Substitution]:
        ''' Operation substitutions. '''
        return Substitution.objects.filter(operation__oss=self.model)

    def inheritance(self) -> QuerySet[Inheritance]:
        ''' Operation inheritances. '''
        return Inheritance.objects.filter(operation__oss=self.model)

    def owned_schemas(self) -> QuerySet[LibraryItem]:
        ''' Get QuerySet containing all result schemas owned by current OSS. '''
        return LibraryItem.objects.filter(
            producer__oss=self.model,
            owner_id=self.model.owner_id,
            location=self.model.location
        )

    def update_positions(self, data: list[dict]) -> None:
        ''' Update positions. '''
        lookup = {x['id']: x for x in data}
        operations = self.operations()
        for item in operations:
            if item.pk in lookup:
                item.position_x = lookup[item.pk]['position_x']
                item.position_y = lookup[item.pk]['position_y']
        Operation.objects.bulk_update(operations, ['position_x', 'position_y'])

    def create_operation(self, **kwargs) -> Operation:
        ''' Insert new operation. '''
        result = Operation.objects.create(oss=self.model, **kwargs)
        self.cache.insert_operation(result)
        self.save(update_fields=['time_update'])
        return result

    def delete_operation(self, target: int, keep_constituents: bool = False):
        ''' Delete operation. '''
        operation = self.cache.operation_by_id[target]
        if not keep_constituents:
            schema = self.cache.get_schema(operation)
            if schema is not None:
                self.before_delete_cst(schema, schema.cache.constituents)
        self.cache.remove_operation(target)
        operation.delete()
        self.save(update_fields=['time_update'])

    def set_input(self, target: int, schema: Optional[LibraryItem]) -> None:
        ''' Set input schema for operation. '''
        operation = self.cache.operation_by_id[target]
        has_children = len(self.cache.graph.outputs[target]) > 0
        old_schema = self.cache.get_schema(operation)
        if schema == old_schema:
            return

        if old_schema is not None:
            if has_children:
                self.before_delete_cst(old_schema, old_schema.cache.constituents)
            self.cache.remove_schema(old_schema)

        operation.result = schema
        if schema is not None:
            operation.alias = schema.alias
            operation.title = schema.title
            operation.comment = schema.comment
        operation.save(update_fields=['result', 'alias', 'title', 'comment'])

        if schema is not None and has_children:
            rsform = RSForm(schema)
            self.after_create_cst(rsform, list(rsform.constituents().order_by('order')))
        self.save(update_fields=['time_update'])

    def set_arguments(self, target: int, arguments: list[Operation]) -> None:
        ''' Set arguments to operation. '''
        self.cache.ensure_loaded()
        operation = self.cache.operation_by_id[target]
        processed: list[Operation] = []
        updated: list[Argument] = []
        deleted: list[Argument] = []
        for current in operation.getQ_arguments():
            if current.argument not in arguments:
                deleted.append(current)
            else:
                processed.append(current.argument)
                current.order = arguments.index(current.argument)
                updated.append(current)
        if len(deleted) > 0:
            self.before_delete_arguments(operation, [x.argument for x in deleted])
            for deleted_arg in deleted:
                self.cache.remove_argument(deleted_arg)
            Argument.objects.filter(pk__in=[x.pk for x in deleted]).delete()
        Argument.objects.bulk_update(updated, ['order'])

        added: list[Operation] = []
        for order, arg in enumerate(arguments):
            if arg not in processed:
                processed.append(arg)
                new_arg = Argument.objects.create(operation=operation, argument=arg, order=order)
                self.cache.insert_argument(new_arg)
                added.append(arg)
        if len(added) > 0:
            self.after_create_arguments(operation, added)
        if len(added) > 0 or len(deleted) > 0:
            self.save(update_fields=['time_update'])

    def set_substitutions(self, target: int, substitutes: list[dict]) -> None:
        ''' Clear all arguments for operation. '''
        self.cache.ensure_loaded()
        operation = self.cache.operation_by_id[target]
        schema = self.cache.get_schema(operation)
        processed: list[dict] = []
        deleted: list[Substitution] = []
        for current in operation.getQ_substitutions():
            subs = [
                x for x in substitutes
                if x['original'] == current.original and x['substitution'] == current.substitution
            ]
            if len(subs) == 0:
                deleted.append(current)
            else:
                processed.append(subs[0])
        if len(deleted) > 0:
            if schema is not None:
                for sub in deleted:
                    self._undo_substitution(schema, sub)
            else:
                for sub in deleted:
                    self.cache.remove_substitution(sub)
                Substitution.objects.filter(pk__in=[x.pk for x in deleted]).delete()

        added: list[Substitution] = []
        for sub_item in substitutes:
            if sub_item not in processed:
                new_sub = Substitution.objects.create(
                    operation=operation,
                    original=sub_item['original'],
                    substitution=sub_item['substitution']
                )
                added.append(new_sub)
        self._process_added_substitutions(schema, added)

        if len(added) > 0 or len(deleted) > 0:
            self.save(update_fields=['time_update'])

    def create_input(self, operation: Operation) -> RSForm:
        ''' Create input RSForm. '''
        schema = RSForm.create(
            owner=self.model.owner,
            alias=operation.alias,
            title=operation.title,
            comment=operation.comment,
            visible=False,
            access_policy=self.model.access_policy,
            location=self.model.location
        )
        Editor.set(schema.model.pk, self.model.getQ_editors().values_list('pk', flat=True))
        operation.result = schema.model
        operation.save()
        self.save(update_fields=['time_update'])
        return schema

    def execute_operation(self, operation: Operation) -> bool:
        ''' Execute target operation. '''
        schemas = [
            arg.argument.result
            for arg in operation.getQ_arguments().order_by('order')
            if arg.argument.result is not None
        ]
        if len(schemas) == 0:
            return False
        substitutions = operation.getQ_substitutions()
        receiver = self.create_input(self.cache.operation_by_id[operation.pk])

        parents: dict = {}
        children: dict = {}
        for operand in schemas:
            schema = RSForm(operand)
            items = list(schema.constituents().order_by('order'))
            new_items = receiver.insert_copy(items)
            for (i, cst) in enumerate(new_items):
                parents[cst.pk] = items[i]
                children[items[i].pk] = cst

        translated_substitutions: list[tuple[Constituenta, Constituenta]] = []
        for sub in substitutions:
            original = children[sub.original.pk]
            replacement = children[sub.substitution.pk]
            translated_substitutions.append((original, replacement))
        receiver.substitute(translated_substitutions)

        for cst in receiver.constituents().order_by('order'):
            parent = parents.get(cst.pk)
            assert parent is not None
            Inheritance.objects.create(
                operation_id=operation.pk,
                child=cst,
                parent=parent
            )

        receiver.restore_order()
        receiver.reset_aliases()
        receiver.resolve_all_text()

        if len(self.cache.graph.outputs[operation.pk]) > 0:
            self.after_create_cst(receiver, list(receiver.constituents().order_by('order')))
        self.save(update_fields=['time_update'])
        return True

    def relocate_down(self, source: RSForm, destination: RSForm, items: list[Constituenta]):
        ''' Move list of constituents to specific schema inheritor. '''
        self.cache.ensure_loaded()
        self.cache.insert_schema(source)
        self.cache.insert_schema(destination)
        operation = self.cache.get_operation(destination.model.pk)

        self._undo_substitutions_cst(items, operation, destination)

        inheritance_to_delete = [item for item in self.cache.inheritance[operation.pk] if item.parent_id in items]
        for item in inheritance_to_delete:
            self.cache.remove_inheritance(item)
        Inheritance.objects.filter(operation_id=operation.pk, parent__in=items).delete()

    def relocate_up(self, source: RSForm, destination: RSForm, items: list[Constituenta]) -> list[Constituenta]:
        ''' Move list of constituents to specific schema upstream. '''
        self.cache.ensure_loaded()
        self.cache.insert_schema(source)
        self.cache.insert_schema(destination)

        operation = self.cache.get_operation(source.model.pk)
        alias_mapping: dict[str, str] = {}
        for item in self.cache.inheritance[operation.pk]:
            if item.parent_id in destination.cache.by_id:
                source_cst = source.cache.by_id[item.child_id]
                destination_cst = destination.cache.by_id[item.parent_id]
                alias_mapping[source_cst.alias] = destination_cst.alias

        new_items = destination.insert_copy(items, initial_mapping=alias_mapping)
        for index, cst in enumerate(new_items):
            new_inheritance = Inheritance.objects.create(
                operation=operation,
                child=items[index],
                parent=cst
            )
            self.cache.insert_inheritance(new_inheritance)
        self.after_create_cst(destination, new_items, exclude=[operation.pk])

        return new_items

    def after_create_cst(
        self, source: RSForm,
        cst_list: list[Constituenta],
        exclude: Optional[list[int]] = None
    ) -> None:
        ''' Trigger cascade resolutions when new constituent is created. '''
        self.cache.insert_schema(source)
        inserted_aliases = [cst.alias for cst in cst_list]
        depend_aliases: set[str] = set()
        for new_cst in cst_list:
            depend_aliases.update(new_cst.extract_references())
        depend_aliases.difference_update(inserted_aliases)
        alias_mapping: CstMapping = {}
        for alias in depend_aliases:
            cst = source.cache.by_alias.get(alias)
            if cst is not None:
                alias_mapping[alias] = cst
        operation = self.cache.get_operation(source.model.pk)
        self._cascade_inherit_cst(operation.pk, source, cst_list, alias_mapping, exclude)

    def after_change_cst_type(self, source: RSForm, target: Constituenta) -> None:
        ''' Trigger cascade resolutions when constituenta type is changed. '''
        self.cache.insert_schema(source)
        operation = self.cache.get_operation(source.model.pk)
        self._cascade_change_cst_type(operation.pk, target.pk, cast(CstType, target.cst_type))

    def after_update_cst(self, source: RSForm, target: Constituenta, data: dict, old_data: dict) -> None:
        ''' Trigger cascade resolutions when constituenta data is changed. '''
        self.cache.insert_schema(source)
        operation = self.cache.get_operation(source.model.pk)
        depend_aliases = self._extract_data_references(data, old_data)
        alias_mapping: CstMapping = {}
        for alias in depend_aliases:
            cst = source.cache.by_alias.get(alias)
            if cst is not None:
                alias_mapping[alias] = cst
        self._cascade_update_cst(
            operation=operation.pk,
            cst_id=target.pk,
            data=data,
            old_data=old_data,
            mapping=alias_mapping
        )

    def before_delete_cst(self, source: RSForm, target: list[Constituenta]) -> None:
        ''' Trigger cascade resolutions before constituents are deleted. '''
        self.cache.insert_schema(source)
        operation = self.cache.get_operation(source.model.pk)
        self._cascade_delete_inherited(operation.pk, target)

    def before_substitute(self, source: RSForm, substitutions: CstSubstitution) -> None:
        ''' Trigger cascade resolutions before constituents are substituted. '''
        self.cache.insert_schema(source)
        operation = self.cache.get_operation(source.model.pk)
        self._cascade_before_substitute(substitutions, operation)

    def before_delete_arguments(self, target: Operation, arguments: list[Operation]) -> None:
        ''' Trigger cascade resolutions before arguments are deleted. '''
        if target.result_id is None:
            return
        for argument in arguments:
            parent_schema = self.cache.get_schema(argument)
            if parent_schema is not None:
                self._execute_delete_inherited(target.pk, parent_schema.cache.constituents)

    def after_create_arguments(self, target: Operation, arguments: list[Operation]) -> None:
        ''' Trigger cascade resolutions after arguments are created. '''
        schema = self.cache.get_schema(target)
        if schema is None:
            return
        for argument in arguments:
            parent_schema = self.cache.get_schema(argument)
            if parent_schema is None:
                continue
            self._execute_inherit_cst(
                target_operation=target.pk,
                source=parent_schema,
                items=list(parent_schema.constituents().order_by('order')),
                mapping={}
            )

    # pylint: disable=too-many-arguments, too-many-positional-arguments
    def _cascade_inherit_cst(
        self, target_operation: int,
        source: RSForm,
        items: list[Constituenta],
        mapping: CstMapping,
        exclude: Optional[list[int]] = None
    ) -> None:
        children = self.cache.graph.outputs[target_operation]
        if len(children) == 0:
            return
        for child_id in children:
            if not exclude or child_id not in exclude:
                self._execute_inherit_cst(child_id, source, items, mapping)

    def _execute_inherit_cst(
        self,
        target_operation: int,
        source: RSForm,
        items: list[Constituenta],
        mapping: CstMapping
    ) -> None:
        operation = self.cache.operation_by_id[target_operation]
        destination = self.cache.get_schema(operation)
        if destination is None:
            return

        self.cache.ensure_loaded()
        new_mapping = self._transform_mapping(mapping, operation, destination)
        alias_mapping = OperationSchema._produce_alias_mapping(new_mapping)
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
        self._cascade_inherit_cst(operation.pk, destination, new_cst_list, new_mapping)

    def _cascade_change_cst_type(self, operation_id: int, cst_id: int, ctype: CstType) -> None:
        children = self.cache.graph.outputs[operation_id]
        if len(children) == 0:
            return
        self.cache.ensure_loaded()
        for child_id in children:
            child_operation = self.cache.operation_by_id[child_id]
            successor_id = self.cache.get_inheritor(cst_id, child_id)
            if successor_id is None:
                continue
            child_schema = self.cache.get_schema(child_operation)
            if child_schema is None:
                continue
            if child_schema.change_cst_type(successor_id, ctype):
                self._cascade_change_cst_type(child_id, successor_id, ctype)

    # pylint: disable=too-many-arguments, too-many-positional-arguments
    def _cascade_update_cst(
        self,
        operation: int,
        cst_id: int,
        data: dict, old_data: dict,
        mapping: CstMapping
    ) -> None:
        children = self.cache.graph.outputs[operation]
        if len(children) == 0:
            return
        self.cache.ensure_loaded()
        for child_id in children:
            child_operation = self.cache.operation_by_id[child_id]
            successor_id = self.cache.get_inheritor(cst_id, child_id)
            if successor_id is None:
                continue
            child_schema = self.cache.get_schema(child_operation)
            assert child_schema is not None
            new_mapping = self._transform_mapping(mapping, child_operation, child_schema)
            alias_mapping = OperationSchema._produce_alias_mapping(new_mapping)
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
            self._cascade_update_cst(
                operation=child_id,
                cst_id=successor_id,
                data=new_data,
                old_data=new_old_data,
                mapping=new_mapping
            )

    def _cascade_delete_inherited(self, operation: int, target: list[Constituenta]) -> None:
        children = self.cache.graph.outputs[operation]
        if len(children) == 0:
            return
        self.cache.ensure_loaded()
        for child_id in children:
            self._execute_delete_inherited(child_id, target)

    def _execute_delete_inherited(self, operation_id: int, parent_cst: list[Constituenta]) -> None:
        operation = self.cache.operation_by_id[operation_id]
        schema = self.cache.get_schema(operation)
        if schema is None:
            return
        self._undo_substitutions_cst(parent_cst, operation, schema)
        target_ids = self.cache.get_inheritors_list([cst.pk for cst in parent_cst], operation_id)
        target_cst = [schema.cache.by_id[cst_id] for cst_id in target_ids]
        self._cascade_delete_inherited(operation_id, target_cst)
        if len(target_cst) > 0:
            self.cache.remove_cst(operation_id, target_ids)
            schema.delete_cst(target_cst)

    def _cascade_before_substitute(self, substitutions: CstSubstitution, operation: Operation) -> None:
        children = self.cache.graph.outputs[operation.pk]
        if len(children) == 0:
            return
        self.cache.ensure_loaded()
        for child_id in children:
            child_operation = self.cache.operation_by_id[child_id]
            child_schema = self.cache.get_schema(child_operation)
            if child_schema is None:
                continue
            new_substitutions = self._transform_substitutions(substitutions, child_id, child_schema)
            if len(new_substitutions) == 0:
                continue
            self._cascade_before_substitute(new_substitutions, child_operation)
            child_schema.substitute(new_substitutions)

    def _cascade_partial_mapping(
        self,
        mapping: CstMapping,
        target: list[int],
        operation: int,
        schema: RSForm
    ) -> None:
        alias_mapping = OperationSchema._produce_alias_mapping(mapping)
        schema.apply_partial_mapping(alias_mapping, target)
        children = self.cache.graph.outputs[operation]
        if len(children) == 0:
            return
        self.cache.ensure_loaded()
        for child_id in children:
            child_operation = self.cache.operation_by_id[child_id]
            child_schema = self.cache.get_schema(child_operation)
            if child_schema is None:
                continue
            new_mapping = self._transform_mapping(mapping, child_operation, child_schema)
            if not new_mapping:
                continue
            new_target = self.cache.get_inheritors_list(target, child_id)
            if len(new_target) == 0:
                continue
            self._cascade_partial_mapping(new_mapping, new_target, child_id, child_schema)

    @staticmethod
    def _produce_alias_mapping(mapping: CstMapping) -> dict[str, str]:
        result: dict[str, str] = {}
        for alias, cst in mapping.items():
            if cst is None:
                result[alias] = DELETED_ALIAS
            else:
                result[alias] = cst.alias
        return result

    def _transform_mapping(self, mapping: CstMapping, operation: Operation, schema: RSForm) -> CstMapping:
        if len(mapping) == 0:
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

    def _determine_insert_position(
        self, prototype_id: int,
        operation: Operation,
        source: RSForm,
        destination: RSForm
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

    def _transform_substitutions(
        self,
        target: CstSubstitution,
        operation: int,
        schema: RSForm
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

    def _undo_substitutions_cst(self, target: list[Constituenta], operation: Operation, schema: RSForm) -> None:
        target_ids = [cst.pk for cst in target]
        to_process = []
        for sub in self.cache.substitutions[operation.pk]:
            if sub.original_id in target_ids or sub.substitution_id in target_ids:
                to_process.append(sub)
        for sub in to_process:
            self._undo_substitution(schema, sub, target_ids)

    def _undo_substitution(
        self,
        schema: RSForm,
        target: Substitution,
        ignore_parents: Optional[list[int]] = None
    ) -> None:
        if ignore_parents is None:
            ignore_parents = []
        operation_id = target.operation_id
        original_schema, _, original_cst, substitution_cst = self.cache.unfold_sub(target)

        dependant = []
        for cst_id in original_schema.get_dependant([original_cst.pk]):
            if cst_id not in ignore_parents:
                inheritor_id = self.cache.get_inheritor(cst_id, operation_id)
                if inheritor_id is not None:
                    dependant.append(inheritor_id)

        self.cache.substitutions[operation_id].remove(target)
        target.delete()

        new_original: Optional[Constituenta] = None
        if original_cst.pk not in ignore_parents:
            full_cst = Constituenta.objects.get(pk=original_cst.pk)
            self.after_create_cst(original_schema, [full_cst])
            new_original_id = self.cache.get_inheritor(original_cst.pk, operation_id)
            assert new_original_id is not None
            new_original = schema.cache.by_id[new_original_id]
        if len(dependant) == 0:
            return

        substitution_id = self.cache.get_inheritor(substitution_cst.pk, operation_id)
        assert substitution_id is not None
        substitution_inheritor = schema.cache.by_id[substitution_id]
        mapping = {substitution_inheritor.alias: new_original}
        self._cascade_partial_mapping(mapping, dependant, operation_id, schema)

    def _process_added_substitutions(self, schema: Optional[RSForm], added: list[Substitution]) -> None:
        if len(added) == 0:
            return
        if schema is None:
            for sub in added:
                self.cache.insert_substitution(sub)
            return

        cst_mapping: CstSubstitution = []
        for sub in added:
            original_id = self.cache.get_inheritor(sub.original_id, sub.operation_id)
            substitution_id = self.cache.get_inheritor(sub.substitution_id, sub.operation_id)
            if original_id is None or substitution_id is None:
                raise ValueError('Substitutions not found.')
            original_cst = schema.cache.by_id[original_id]
            substitution_cst = schema.cache.by_id[substitution_id]
            cst_mapping.append((original_cst, substitution_cst))
        self.before_substitute(schema, cst_mapping)
        schema.substitute(cst_mapping)
        for sub in added:
            self.cache.insert_substitution(sub)


class OssCache:
    ''' Cache for OSS data. '''

    def __init__(self, oss: OperationSchema):
        self._oss = oss
        self._schemas: list[RSForm] = []
        self._schema_by_id: dict[int, RSForm] = {}

        self.operations = list(oss.operations().only('result_id'))
        self.operation_by_id = {operation.pk: operation for operation in self.operations}
        self.graph = Graph[int]()
        for operation in self.operations:
            self.graph.add_node(operation.pk)
        for argument in self._oss.arguments().only('operation_id', 'argument_id').order_by('order'):
            self.graph.add_edge(argument.argument_id, argument.operation_id)

        self.is_loaded = False
        self.substitutions: dict[int, list[Substitution]] = {}
        self.inheritance: dict[int, list[Inheritance]] = {}

    def ensure_loaded(self) -> None:
        ''' Ensure cache is fully loaded. '''
        if self.is_loaded:
            return
        self.is_loaded = True
        for operation in self.operations:
            self.inheritance[operation.pk] = []
            self.substitutions[operation.pk] = []
        for sub in self._oss.substitutions().only('operation_id', 'original_id', 'substitution_id'):
            self.substitutions[sub.operation_id].append(sub)
        for item in self._oss.inheritance().only('operation_id', 'parent_id', 'child_id'):
            self.inheritance[item.operation_id].append(item)

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

    def get_operation(self, schema: int) -> Operation:
        ''' Get operation by schema. '''
        for operation in self.operations:
            if operation.result_id == schema:
                return operation
        raise ValueError(f'Operation for schema {schema} not found')

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

    def insert_schema(self, schema: RSForm) -> None:
        ''' Insert new schema. '''
        if not self._schema_by_id.get(schema.model.pk):
            schema.cache.ensure_loaded()
            self._insert_new(schema)

    def insert_operation(self, operation: Operation) -> None:
        ''' Insert new operation. '''
        self.operations.append(operation)
        self.operation_by_id[operation.pk] = operation
        self.graph.add_node(operation.pk)
        if self.is_loaded:
            self.substitutions[operation.pk] = []
            self.inheritance[operation.pk] = []

    def insert_argument(self, argument: Argument) -> None:
        ''' Insert new argument. '''
        self.graph.add_edge(argument.argument_id, argument.operation_id)

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

    def remove_schema(self, schema: RSForm) -> None:
        ''' Remove schema from cache. '''
        self._schemas.remove(schema)
        del self._schema_by_id[schema.model.pk]

    def remove_operation(self, operation: int) -> None:
        ''' Remove operation from cache. '''
        target = self.operation_by_id[operation]
        self.graph.remove_node(operation)
        if target.result_id in self._schema_by_id:
            self._schemas.remove(self._schema_by_id[target.result_id])
            del self._schema_by_id[target.result_id]
        self.operations.remove(self.operation_by_id[operation])
        del self.operation_by_id[operation]
        if self.is_loaded:
            del self.substitutions[operation]
            del self.inheritance[operation]

    def remove_argument(self, argument: Argument) -> None:
        ''' Remove argument from cache. '''
        self.graph.remove_edge(argument.argument_id, argument.operation_id)

    def remove_substitution(self, target: Substitution) -> None:
        ''' Remove substitution from cache. '''
        self.substitutions[target.operation_id].remove(target)

    def remove_inheritance(self, target: Inheritance) -> None:
        ''' Remove inheritance from cache. '''
        self.inheritance[target.operation_id].remove(target)

    def unfold_sub(self, sub: Substitution) -> tuple[RSForm, RSForm, Constituenta, Constituenta]:
        operation = self.operation_by_id[sub.operation_id]
        parents = self.graph.inputs[operation.pk]
        original_cst = None
        substitution_cst = None
        original_schema = None
        substitution_schema = None
        for parent_id in parents:
            parent_schema = self.get_schema(self.operation_by_id[parent_id])
            if parent_schema is None:
                continue
            if sub.original_id in parent_schema.cache.by_id:
                original_schema = parent_schema
                original_cst = original_schema.cache.by_id[sub.original_id]
            if sub.substitution_id in parent_schema.cache.by_id:
                substitution_schema = parent_schema
                substitution_cst = substitution_schema.cache.by_id[sub.substitution_id]
        if original_schema is None or substitution_schema is None or original_cst is None or substitution_cst is None:
            raise ValueError(f'Parent schema for Substitution-{sub.pk} not found.')
        return original_schema, substitution_schema, original_cst, substitution_cst

    def _insert_new(self, schema: RSForm) -> None:
        self._schemas.append(schema)
        self._schema_by_id[schema.model.pk] = schema
