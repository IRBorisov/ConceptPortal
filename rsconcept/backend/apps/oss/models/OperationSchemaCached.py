''' Models: OSS API. '''
# pylint: disable=duplicate-code

from typing import Optional

from apps.library.models import LibraryItem
from apps.rsform.models import Attribution, Constituenta, CstType, OrderManager, RSFormCached

from .Argument import Argument
from .Inheritance import Inheritance
from .Operation import Operation
from .OperationSchema import OperationSchema
from .OssCache import OssCache
from .PropagationEngine import PropagationEngine
from .Substitution import Substitution
from .utils import CstMapping, CstSubstitution, create_dependant_mapping, extract_data_references


class OperationSchemaCached:
    ''' Operations schema API with caching. '''

    def __init__(self, model: LibraryItem):
        self.model = model
        self.cache = OssCache(model.pk)
        self.engine = PropagationEngine(self.cache)

    def delete_replica(self, target: int, keep_connections: bool = False, keep_constituents: bool = False):
        ''' Delete Replica Operation. '''
        if not keep_connections:
            self.delete_operation(target, keep_constituents)
            return
        self.cache.ensure_loaded_subs()
        operation = self.cache.operation_by_id[target]
        original = self.cache.replica_original.get(target)
        if original:
            for arg in operation.getQ_as_argument():
                arg.argument_id = original
                arg.save()
        self.cache.remove_operation(target)
        operation.delete()


    def delete_operation(self, target: int, keep_constituents: bool = False):
        ''' Delete Operation. '''
        self.cache.ensure_loaded_subs()
        operation = self.cache.operation_by_id[target]
        children = self.cache.extend_graph.outputs[target]
        if operation.result is not None and children:
            ids = list(Constituenta.objects.filter(schema=operation.result).values_list('pk', flat=True))
            if not keep_constituents:
                self.engine.on_delete_inherited(operation.pk, ids)
            else:
                inheritance_to_delete: list[Inheritance] = []
                for child_id in children:
                    child_operation = self.cache.operation_by_id[child_id]
                    child_schema = self.cache.get_schema(child_operation)
                    if child_schema is None:
                        continue
                    self.engine.undo_substitutions_cst(ids, child_operation, child_schema)
                    for item in self.cache.inheritance[child_id]:
                        if item.parent_id in ids:
                            inheritance_to_delete.append(item)
                for item in inheritance_to_delete:
                    self.cache.remove_inheritance(item)
                Inheritance.objects.filter(pk__in=[item.pk for item in inheritance_to_delete]).delete()
        self.cache.remove_operation(target)
        operation.delete()

    def set_input(self, target: int, schema: Optional[LibraryItem]) -> None:
        ''' Set input schema for operation. '''
        operation = self.cache.operation_by_id[target]
        has_children = bool(self.cache.extend_graph.outputs[target])
        old_schema = self.cache.get_schema(operation)
        if schema is None and old_schema is None or \
                (schema is not None and old_schema is not None and schema.pk == old_schema.model.pk):
            return

        if old_schema is not None:
            if has_children:
                self.before_delete_cst(old_schema.model.pk, [cst.pk for cst in old_schema.cache.constituents])
            self.cache.remove_schema(old_schema)

        operation.setQ_result(schema)
        if schema is not None:
            operation.alias = schema.alias
            operation.title = schema.title
            operation.description = schema.description
        operation.save(update_fields=['alias', 'title', 'description'])

        if schema is not None and has_children:
            rsform = RSFormCached(schema)
            self.after_create_cst(rsform, list(rsform.constituentsQ().order_by('order')))

    def set_arguments(self, target: int, arguments: list[Operation]) -> None:
        ''' Set arguments of target Operation. '''
        self.cache.ensure_loaded_subs()
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
        if deleted:
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
        if added:
            self.after_create_arguments(operation, added)

    def set_substitutions(self, target: int, substitutes: list[dict]) -> None:
        ''' Clear all arguments for target Operation. '''
        self.cache.ensure_loaded_subs()
        operation = self.cache.operation_by_id[target]
        schema = self.cache.get_schema(operation)
        processed: list[dict] = []
        deleted: list[Substitution] = []
        for current in operation.getQ_substitutions():
            subs = [
                x for x in substitutes
                if x['original'] == current.original and x['substitution'] == current.substitution
            ]
            if not subs:
                deleted.append(current)
            else:
                processed.append(subs[0])
        if deleted:
            if schema is not None:
                for sub in deleted:
                    self.engine.undo_substitution(schema, sub)
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
        self._on_add_substitutions(schema, added)

    def execute_operation(self, operation: Operation) -> bool:
        ''' Execute target Operation. '''
        schemas: list[int] = [
            arg.argument.result_id
            for arg in Argument.objects
            .filter(operation=operation)
            .select_related('argument')
            .only('argument__result_id')
            .order_by('order')
            if arg.argument.result_id is not None
        ]
        if not schemas:
            return False
        substitutions = operation.getQ_substitutions()
        receiver = OperationSchema.create_input(self.model, self.cache.operation_by_id[operation.pk])
        self.cache.insert_schema(receiver)

        parents: dict = {}
        children: dict = {}
        for operand in schemas:
            new_items = receiver.insert_from(operand)
            for (old_cst, new_cst) in new_items:
                parents[new_cst.pk] = old_cst
                children[old_cst.pk] = new_cst

        translated_substitutions: list[tuple[Constituenta, Constituenta]] = []
        for sub in substitutions:
            original = children[sub.original.pk]
            replacement = children[sub.substitution.pk]
            translated_substitutions.append((original, replacement))
        receiver.substitute(translated_substitutions)

        for cst in Constituenta.objects.filter(schema=receiver.model).order_by('order'):
            parent = parents.get(cst.pk)
            assert parent is not None
            Inheritance.objects.create(
                operation_id=operation.pk,
                child=cst,
                parent=parent
            )

        OrderManager(receiver).restore_order()
        receiver.reset_aliases()
        receiver.resolve_all_text()

        if self.cache.extend_graph.outputs[operation.pk]:
            receiver_items = list(Constituenta.objects.filter(schema=receiver.model).order_by('order'))
            self.after_create_cst(receiver, receiver_items)
        receiver.model.save(update_fields=['time_update'])
        return True

    def relocate_down(self, source: RSFormCached, destination: RSFormCached, items: list[int]):
        ''' Move list of Constituents to destination Schema inheritor. '''
        self.cache.ensure_loaded_subs()
        self.cache.insert_schema(source)
        self.cache.insert_schema(destination)
        operation = self.cache.get_operation(destination.model.pk)
        self.engine.undo_substitutions_cst(items, operation, destination)
        inheritance_to_delete = [item for item in self.cache.inheritance[operation.pk] if item.parent_id in items]
        for item in inheritance_to_delete:
            self.cache.remove_inheritance(item)
        Inheritance.objects.filter(operation_id=operation.pk, parent_id__in=items).delete()

    def relocate_up(self, source: RSFormCached, destination: RSFormCached,
                    item_ids: list[int]) -> list[Constituenta]:
        ''' Move list of Constituents upstream to destination Schema. '''
        self.cache.ensure_loaded_subs()
        self.cache.insert_schema(source)
        self.cache.insert_schema(destination)

        operation = self.cache.get_operation(source.model.pk)
        alias_mapping: dict[str, str] = {}
        for item in self.cache.inheritance[operation.pk]:
            if item.parent_id in destination.cache.by_id:
                source_cst = source.cache.by_id[item.child_id]
                destination_cst = destination.cache.by_id[item.parent_id]
                alias_mapping[source_cst.alias] = destination_cst.alias

        new_items = destination.insert_from(source.model.pk, item_ids, alias_mapping)
        for (cst, new_cst) in new_items:
            new_inheritance = Inheritance.objects.create(
                operation=operation,
                child=cst,
                parent=new_cst
            )
            self.cache.insert_inheritance(new_inheritance)
        new_constituents = [item[1] for item in new_items]
        self.after_create_cst(destination, new_constituents, exclude=[operation.pk])
        destination.model.save(update_fields=['time_update'])
        return new_constituents

    def after_create_cst(
        self, source: RSFormCached,
        cst_list: list[Constituenta],
        exclude: Optional[list[int]] = None
    ) -> None:
        ''' Trigger cascade resolutions when new Constituenta is created. '''
        self.cache.insert_schema(source)
        alias_mapping = create_dependant_mapping(source, cst_list)
        operation = self.cache.get_operation(source.model.pk)
        self.engine.on_inherit_cst(operation.pk, source, cst_list, alias_mapping, exclude)

    def after_change_cst_type(self, schemaID: int, target: int, new_type: CstType) -> None:
        ''' Trigger cascade resolutions when Constituenta type is changed. '''
        operation = self.cache.get_operation(schemaID)
        self.engine.on_change_cst_type(operation.pk, target, new_type)

    def after_update_cst(self, source: RSFormCached, target: int, data: dict, old_data: dict) -> None:
        ''' Trigger cascade resolutions when Constituenta data is changed. '''
        self.cache.insert_schema(source)
        operation = self.cache.get_operation(source.model.pk)
        depend_aliases = extract_data_references(data, old_data)
        alias_mapping: CstMapping = {}
        for alias in depend_aliases:
            cst = source.cache.by_alias.get(alias)
            if cst is not None:
                alias_mapping[alias] = cst
        self.engine.on_update_cst(
            operation=operation.pk,
            cst_id=target,
            data=data,
            old_data=old_data,
            mapping=alias_mapping
        )

    def before_delete_cst(self, operationID: int, target: list[int]) -> None:
        ''' Trigger cascade resolutions before Constituents are deleted. '''
        operation = self.cache.get_operation(operationID)
        self.engine.on_delete_inherited(operation.pk, target)

    def before_substitute(self, schemaID: int, substitutions: CstSubstitution) -> None:
        ''' Trigger cascade resolutions before Constituents are substituted. '''
        operation = self.cache.get_operation(schemaID)
        self.engine.on_before_substitute(operation.pk, substitutions)

    def before_delete_arguments(self, target: Operation, arguments: list[Operation]) -> None:
        ''' Trigger cascade resolutions before arguments are deleted. '''
        if target.result_id is None:
            return
        for argument in arguments:
            parent_schema = self.cache.get_schema(argument)
            if parent_schema is not None:
                self.engine.delete_inherited(target.pk, [cst.pk for cst in parent_schema.cache.constituents])

    def after_create_arguments(self, target: Operation, arguments: list[Operation]) -> None:
        ''' Trigger cascade resolutions after arguments are created. '''
        schema = self.cache.get_schema(target)
        if schema is None:
            return
        for argument in arguments:
            parent_schema = self.cache.get_schema(argument)
            if parent_schema is None:
                continue
            self.engine.inherit_cst(
                target_operation=target.pk,
                source=parent_schema,
                items=list(parent_schema.constituentsQ().order_by('order')),
                mapping={}
            )

    def after_create_attribution(self, schemaID: int, attributions: list[Attribution],
                                 exclude: Optional[list[int]] = None) -> None:
        ''' Trigger cascade resolutions when Attribution is created. '''
        operation = self.cache.get_operation(schemaID)
        self.engine.on_inherit_attribution(operation.pk, attributions, exclude)

    def before_delete_attribution(self, schemaID: int, attributions: list[Attribution]) -> None:
        ''' Trigger cascade resolutions when Attribution is deleted. '''
        operation = self.cache.get_operation(schemaID)
        self.engine.on_delete_attribution(operation.pk, attributions)

    def _on_add_substitutions(self, schema: Optional[RSFormCached], added: list[Substitution]) -> None:
        ''' Trigger cascade resolutions when Constituenta substitution is added. '''
        if not added:
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
        self.before_substitute(schema.model.pk, cst_mapping)
        schema.substitute(cst_mapping)
        for sub in added:
            self.cache.insert_substitution(sub)
