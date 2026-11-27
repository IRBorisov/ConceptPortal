''' Regression tests for changes propagated through relativization. '''
from concurrent.futures import ThreadPoolExecutor
from threading import Event

from django.db import connection, connections, transaction
from django.test import TransactionTestCase, skipUnlessDBFeature
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.request import Request
from rest_framework.test import APIClient

from apps.library.models import AccessPolicy, Editor, LibraryItem
from apps.library.services.clone import clone_oss
from apps.oss.models import Inheritance, Operation, OperationSchema, OperationType, Substitution
from apps.rsform.models import Attribution, Constituenta, RSForm
from apps.rsform.mutations import update_constituenta
from apps.users.models import User
from shared.EndpointTester import EndpointTester


class TestRelativizationPropagation(EndpointTester):
    ''' Exercise the source mutations and the real calculator through the API. '''

    def setUp(self):
        super().setUp()
        self.oss = OperationSchema.create(alias='OSS', title='Operations', owner=self.user, location='test')
        self.source, self.source_operation = self._input('Source')
        self.other, self.other_operation = self._input('Other')
        self.base = self.source.insert_last('X1', term_raw='Vertices', convention='Vertices in the source.')
        self.other_base = self.other.insert_last('X1', term_raw='Other vertices')

    def test_create_without_review(self):
        self.source.model.refresh_from_db()
        url = f'/api/oss/{self.oss.model.pk}/create-relativization'
        data = {
            'source_operation': self.source_operation.pk,
            'source_time_update': self.source.model.time_update.isoformat(),
            'target': self.base.pk,
            'excluded': [],
            'locale': 'en',
            'context_name': 'context',
            'item_data': {'alias': 'Quick', 'title': 'Quick result', 'parent': None},
            'layout': [],
            'position': {'x': 0, 'y': 0, 'width': 150, 'height': 40},
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST, response.data)
        self.assertIn('revision', response.data)
        quick = data | {'skip_review': True}
        response = self.client.post(url, quick | {'reviewed': []}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST, response.data)
        response = self.client.post(url, quick | {'source_time_update': '2026-01-01T00:00:00Z'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT, response.data)
        response = self.client.post(url, quick | {'excluded': [self.base.pk]}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST, response.data)
        self.assertFalse(LibraryItem.objects.filter(alias='Quick').exists())

        response = self.client.post(url, quick, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        operation = Operation.objects.get(pk=response.data['new_operation'])
        state = next(row for row in response.data['oss']['operations'] if row['id'] == operation.pk)
        self.assertTrue(state['relativization']['unreviewed'])
        axis = next(row for row in operation.projection['rows'] if row['role'] == 'axis')
        self.assertEqual(axis['confirmed'], {})
        self.assertTrue(axis['needs_review'])
        item = Constituenta.objects.get(pk=axis['result'])
        self.assertEqual(item.term_raw, data['context_name'])
        self.assertEqual(item.term_raw, axis['suggested']['term_raw'])

    def _input(self, alias, oss=None, schema=None):
        oss = oss or self.oss
        schema = schema or RSForm.create(alias=alias, title=alias, owner=self.user, location='test')
        operation = oss.create_operation(alias=alias, operation_type=OperationType.INPUT, result=schema.model)
        return schema, operation

    def _relativize(self, target=None, excluded=None, existing=None, source_operation=None, **details):
        self.source.model.refresh_from_db()
        params = {
            'source_operation': (source_operation or self.source_operation).pk,
            'source_time_update': self.source.model.time_update.isoformat(),
            'target': (target or self.base).pk,
            'excluded': [item.pk for item in excluded or []],
            'locale': 'en',
            'context_name': 'context',
        }
        if existing:
            params['existing_operation'] = existing.pk
        response = self.client.post(f'/api/oss/{self.oss.model.pk}/preview-relativization', params, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        draft = response.data
        items = {item['id']: item for item in draft['items']}
        reviewed = [row for row in draft['proposals'] if row['inKernel'] and row['changed']]
        edits = [
            {'id': row['id'], 'clarified': True, **{
                field: items[row['id']][field] or 'Reviewed text'
                for field in ('term_raw', 'definition_raw', 'convention')
            }}
            for row in reviewed if row['ambiguous'] or row['missing']
        ]
        response = self.client.post(f'/api/oss/{self.oss.model.pk}/create-relativization', params | {
            'item_data': {'alias': 'Relative', 'title': 'Relative', 'parent': None},
            'layout': [],
            'position': {'x': 0, 'y': 0, 'width': 150, 'height': 40},
            'revision': draft['revision'],
            'reviewed': [row['id'] for row in reviewed],
            'edits': edits,
            **details,
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        return Operation.objects.get(pk=response.data['new_operation'])

    def _synthesize(self, alias, left, right, substitutions=(), oss=None):
        oss = oss or self.oss
        response = self.client.post(f'/api/oss/{oss.model.pk}/create-synthesis', {
            'item_data': {'alias': alias, 'title': alias, 'parent': None},
            'layout': [],
            'position': {'x': 0, 'y': 0, 'width': 150, 'height': 40},
            'arguments': [left.pk, right.pk],
            'substitutions': [{'original': original.pk, 'substitution': replacement.pk}
                              for original, replacement in substitutions],
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        return Operation.objects.get(pk=response.data['new_operation'])

    def _update(self, item, **data):
        return self.client.patch(f'/api/rsforms/{item.schema_id}/update-cst', {
            'target': item.pk, 'item_data': data,
        }, format='json')

    def _delete(self, item):
        return self.client.patch(f'/api/rsforms/{item.schema_id}/delete-multiple-cst', {
            'items': [item.pk],
        }, format='json')

    def _substitute(self, original, replacement):
        return self.client.patch(f'/api/rsforms/{original.schema_id}/substitute', {
            'substitutions': [{'original': original.pk, 'substitution': replacement.pk}],
        }, format='json')

    def _create_term(self, schema_id, alias, definition, after, **texts):
        response = self.client.post(f'/api/rsforms/{schema_id}/create-cst', {
            'alias': alias, 'cst_type': 'term', 'term_raw': alias,
            'definition_formal': definition, 'insert_after': after.pk, **texts,
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        return Constituenta.objects.get(pk=response.data['new_cst']['id'])

    def _row(self, operation, origin, role):
        operation.refresh_from_db()
        return Constituenta.objects.get(pk=next(
            row['result'] for row in operation.projection['rows']
            if row['origin'] == (origin.pk if origin is not None else None) and row['role'] == role
        ))

    def _assert_rejected(self, action, error_key, operations):
        schema_ids = [op.result_id for op in operations]
        operation_ids = [op.pk for op in operations]

        def state():
            return {
                'revisions': list(LibraryItem.objects.filter(pk__in=schema_ids).order_by('pk')
                                  .values_list('pk', 'time_update')),
                'projections': list(Operation.objects.filter(pk__in=operation_ids).order_by('pk')
                                    .values_list('pk', 'projection')),
                'constituents': list(Constituenta.objects.filter(schema_id__in=schema_ids).order_by('pk').values_list(
                    'pk', 'alias', 'cst_type', 'definition_formal', 'typification_manual', 'value_is_property',
                )),
                'inheritances': list(Inheritance.objects.filter(operation_id__in=operation_ids).order_by('pk')
                                     .values_list('pk', 'parent_id', 'child_id')),
                'substitutions': list(Substitution.objects.filter(operation_id__in=operation_ids).order_by('pk')
                                      .values_list('pk', 'original_id', 'substitution_id')),
            }

        before = state()
        response = action()
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST, response.data)
        self.assertIn(error_key, response.data)
        self.assertEqual(state(), before)

    def test_reject_target_deletion_retyping_and_invalid_definition(self):
        target = self.source.insert_last(
            'S1', definition_formal='X1', term_raw='Selected vertices', convention='A set of vertices.',
        )
        new_target = self.source.insert_last(
            'S2', definition_formal='X1', term_raw='Other selection', convention='Another set of vertices.',
        )
        self.source.insert_last('D1', definition_formal='S1')
        relativization = self._relativize(target)
        self.assertEqual(self._row(relativization, target, 'axis').definition_formal, '\u212c(X1)')
        replacement = self.other.insert_last('S1', definition_formal='X1')
        direct = self._synthesize('Direct', self.source_operation, self.other_operation, [(target, replacement)])
        downstream = self._synthesize('Downstream', relativization, self.other_operation)
        operations = [self.source_operation, direct, relativization, downstream]
        for change, action in (
            ('delete', lambda: self._delete(target)),
            ('substitute', lambda: self._substitute(target, new_target)),
            ('change type', lambda: self._update(target, cst_type='term')),
            ('invalidate definition', lambda: self._update(target, definition_formal='X1\u222a')),
        ):
            with self.subTest(change=change):
                self._assert_rejected(action, 'target', operations)

    def test_reject_new_error_in_a_transformed_expression(self):
        self.source.insert_last('X2', term_raw='Edges', convention='Edges in the source.')
        term = self.source.insert_last('D1', definition_formal='X2')
        self.source.insert_last('D2', definition_formal='D1\u222aX2')
        relativization = self._relativize()
        direct = self._synthesize('Direct', self.source_operation, self.other_operation)
        downstream = self._synthesize('Downstream', relativization, self.other_operation)
        self._assert_rejected(
            lambda: self._update(term, definition_formal='X1', typification_manual='\u212c(X2)'),
            'projection',
            [self.source_operation, direct, relativization, downstream],
        )

    def test_remove_deleted_constituent_from_exclusions(self):
        excluded = self.source.insert_last('X2', term_raw='Excluded vertices')
        relativization = self._relativize(excluded=[excluded])
        preserved = self._row(relativization, excluded, 'preserved')
        self.assertEqual(relativization.projection['excluded'], [excluded.pk])

        response = self._delete(excluded)
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        relativization.refresh_from_db()
        self.assertEqual(relativization.projection['excluded'], [])
        self.assertFalse(Constituenta.objects.filter(pk=preserved.pk).exists())

    def test_library_delete_rolls_back_when_synthesis_loses_relativization_target(self):
        removed_schema_id = self.source.model.pk
        synthesis = self._synthesize('Synthesis', self.source_operation, self.other_operation)
        target = Inheritance.objects.get(operation=synthesis, parent=self.base).child
        self.source = RSForm(synthesis.result)
        relativization = self._relativize(target, source_operation=synthesis)

        self._assert_rejected(
            lambda: self.client.delete(f'/api/library/{removed_schema_id}'),
            'target', [self.source_operation, synthesis, relativization],
        )
        self.assertTrue(LibraryItem.objects.filter(pk=removed_schema_id).exists())

    def test_library_delete_refreshes_indirect_relativization(self):
        removed_schema_id = self.other.model.pk
        synthesis = self._synthesize('Synthesis', self.source_operation, self.other_operation)
        target = Inheritance.objects.get(operation=synthesis, parent=self.base).child
        excluded = Inheritance.objects.get(operation=synthesis, parent=self.other_base).child
        self.source = RSForm(synthesis.result)
        relativization = self._relativize(target, excluded=[excluded], source_operation=synthesis)
        preserved = self._row(relativization, excluded, 'preserved')

        response = self.client.delete(f'/api/library/{removed_schema_id}')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT, response.data)
        relativization.refresh_from_db()
        self.assertEqual(relativization.projection['excluded'], [])
        self.assertFalse(Constituenta.objects.filter(pk=preserved.pk).exists())

    def test_review_requires_access_to_the_existing_result(self):
        relativization = self._relativize()
        Editor.add(self.oss.model.pk, self.user2.pk)
        self.login2()
        url = f'/api/oss/{self.oss.model.pk}'
        data = {
            'source_operation': self.source_operation.pk,
            'source_time_update': self.source.model.time_update.isoformat(),
            'existing_operation': relativization.pk,
            'target': self.base.pk,
            'excluded': [],
            'locale': 'en',
            'context_name': 'context',
        }
        preview = self.client.post(f'{url}/preview-relativization', data, format='json')
        self.assertEqual(preview.status_code, status.HTTP_200_OK, preview.data)
        self.assertTrue(preview.data['prior'])
        denied = self.client.post(f'{url}/create-relativization', data | {
            'item_data': {'title': 'Relative', 'alias': 'Relative', 'parent': None},
            'layout': [],
            'position': {'x': 0, 'y': 0, 'width': 150, 'height': 40},
            'revision': '0' * 64,
            'reviewed': [],
            'edits': [],
        }, format='json')
        self.assertEqual(denied.status_code, status.HTTP_403_FORBIDDEN, denied.data)

        self.login()
        response = self.client.patch(f'/api/library/{relativization.result_id}/set-access-policy', {
            'access_policy': AccessPolicy.PRIVATE,
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.login2()
        denied = self.client.post(f'{url}/preview-relativization', data, format='json')
        self.assertEqual(denied.status_code, status.HTTP_403_FORBIDDEN, denied.data)
        self.assertNotIn('prior', denied.data)

    def test_managed_crucial_flag_is_changed_through_the_source(self):
        relativization = self._relativize()
        generated = self._row(relativization, self.base, 'carrier')
        self.assertFalse(generated.crucial)

        bulk_url = f'/api/rsforms/{relativization.result_id}/update-crucial'
        bulk_edit = self.client.patch(bulk_url, {'target': [generated.pk], 'value': True}, format='json')
        self.assertEqual(bulk_edit.status_code, status.HTTP_400_BAD_REQUEST, bulk_edit.data)
        single_edit = self._update(generated, crucial=True)
        self.assertEqual(single_edit.status_code, status.HTTP_400_BAD_REQUEST, single_edit.data)
        generated.refresh_from_db()
        self.assertFalse(generated.crucial)

        source_url = f'/api/rsforms/{self.source.model.pk}/update-crucial'
        source_edit = self.client.patch(source_url, {'target': [self.base.pk], 'value': True}, format='json')
        self.assertEqual(source_edit.status_code, status.HTTP_200_OK, source_edit.data)
        generated.refresh_from_db()
        self.assertTrue(generated.crucial)
        unchanged = self.client.patch(bulk_url, {'target': [generated.pk], 'value': True}, format='json')
        self.assertEqual(unchanged.status_code, status.HTTP_200_OK, unchanged.data)

    def test_managed_definition_guard_compares_to_the_current_row(self):
        term = self.source.insert_last('D1', definition_formal='X1')
        relativization = self._relativize()
        stale = self._row(relativization, term, 'family')
        response = self._update(term, definition_formal='X1∪X1')
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        current = self._row(relativization, term, 'family')
        self.assertEqual(current.pk, stale.pk)
        self.assertNotEqual(current.definition_formal, stale.definition_formal)
        current_formula = current.definition_formal

        request = Request(self.factory.patch('/'))
        request.user = self.user
        result = relativization.result
        assert result is not None
        with self.assertRaisesMessage(ValidationError, 'Edit managed definitions and types'):
            update_constituenta(result, stale, {'definition_formal': stale.definition_formal}, request)

        convention = 'A reviewed convention.'
        response = self._update(current, definition_formal=current_formula, convention=convention)
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        current.refresh_from_db()
        self.assertEqual(current.definition_formal, current_formula)
        self.assertEqual(current.convention, convention)

    def test_reject_target_edit_that_makes_a_family_unevaluable(self):
        target = self.source.insert_last(
            'S1', definition_formal='\u212c(X1)', term_raw='Contexts', convention='Sets of vertices.',
        )
        self.source.insert_last('D1', definition_formal='X1')
        relativization = self._relativize(target)
        downstream = self._synthesize('Downstream', relativization, self.other_operation)
        self._assert_rejected(
            lambda: self._update(target, value_is_property=True),
            'projection',
            [self.source_operation, relativization, downstream],
        )

    def test_add_edit_and_remove_a_family_in_another_oss(self):
        relativization = self._relativize()
        external_oss = OperationSchema.create(alias='External', title='External', owner=self.user, location='test')
        _, imported = self._input('Imported', external_oss, RSForm(relativization.result))
        _, external_argument = self._input('Independent', external_oss)
        external = self._synthesize('Synthesis', imported, external_argument, oss=external_oss)
        term = self._create_term(
            self.source.model.pk, 'D1', 'X1', self.base,
            term_raw='Additional set', definition_raw='The additional set.',
        )
        family = self._row(relativization, term, 'family')
        self.assertTrue(family.definition_formal.startswith('I{'))
        inherited = Inheritance.objects.get(operation=external, parent=family).child
        self.assertTrue(family.term_resolved)
        self.assertTrue(family.definition_resolved)
        self.assertEqual(inherited.term_resolved, family.term_resolved)
        self.assertEqual(inherited.definition_resolved, family.definition_resolved)
        own = self._create_term(relativization.result_id, 'D99', family.alias, family)
        dependent = self._create_term(self.source.model.pk, 'D2', term.alias, term)
        accessor = self._row(relativization, None, 'accessor')
        projected_dependent = self._row(relativization, dependent, 'family')
        self.assertIn(f'{accessor.alias}[', projected_dependent.definition_formal)
        self.assertTrue(Inheritance.objects.filter(operation=external, parent=accessor).exists())

        response = self._update(dependent, definition_formal='X1')
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.assertEqual(self._row(relativization, dependent, 'family').pk, projected_dependent.pk)
        self.assertFalse(Constituenta.objects.filter(pk=accessor.pk).exists())
        self.assertFalse(Inheritance.objects.filter(operation=external, parent_id=accessor.pk).exists())

        response = self._update(term, definition_formal='X1\u222a')
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.assertEqual(self._row(relativization, term, 'preserved').pk, family.pk)
        self.assertTrue(Inheritance.objects.get(operation=external, parent=family).child.definition_formal.endswith('\u222a'))
        response = self._update(term, definition_formal='X1')
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.assertEqual(self._row(relativization, term, 'family').pk, family.pk)

        response = self._delete(term)
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.assertFalse(Constituenta.objects.filter(pk=family.pk).exists())
        own.refresh_from_db()
        self.assertEqual(own.definition_formal, 'DEL')
        self.assertEqual(Inheritance.objects.get(operation=external, parent=own).child.definition_formal, 'DEL')

    def test_disappearing_projection_on_both_sides_of_substitution(self):
        participant = self.source.insert_last(
            'X2', term_raw='Participants', convention='Participants in the source.',
        )
        original = self.other.insert_last(
            'S1', definition_formal='X1', term_raw='Other role', convention='A set of other vertices.',
        )
        return_to_original = self.other.insert_last('D1', definition_formal=original.alias)
        relativization = self._relativize()
        relation = self._row(relativization, participant, 'relation')
        first = self._synthesize('Original', relativization, self.other_operation, [(relation, original)])
        second = self._synthesize('Replacement', relativization, self.other_operation, [(original, relation)])
        kept = Inheritance.objects.get(operation=first, parent=original).child
        removed = Inheritance.objects.get(operation=second, parent=relation).child
        first_own = self._create_term(first.result_id, 'D99', kept.alias, kept)
        second_own = self._create_term(second.result_id, 'D99', removed.alias, removed)

        updated = self._relativize(excluded=[participant], existing=relativization)
        self.assertEqual(updated.result_id, relativization.result_id)
        self.assertFalse(Constituenta.objects.filter(pk__in=[relation.pk, removed.pk]).exists())
        self.assertFalse(first.getQ_substitutions().exists())
        self.assertFalse(second.getQ_substitutions().exists())
        first_own.refresh_from_db()
        second_own.refresh_from_db()
        self.assertEqual(first_own.definition_formal, kept.alias)
        self.assertEqual(second_own.definition_formal, 'DEL')
        restored = Inheritance.objects.get(operation=second, parent=original).child
        self.assertEqual(
            Inheritance.objects.get(operation=second, parent=return_to_original).child.definition_formal,
            restored.alias,
        )

    def test_refresh_updates_projection_order_and_keeps_own_rows(self):
        first = self.source.insert_last('D1', definition_formal='X1')
        second = self.source.insert_last('D2', definition_formal='X1')
        relativization = self._relativize()
        projected_first = self._row(relativization, first, 'family')
        projected_second = self._row(relativization, second, 'family')
        own = self._create_term(relativization.result_id, 'D99', 'X1', projected_first)

        def move():
            response = self.client.patch(f'/api/rsforms/{self.source.model.pk}/move-cst', {
                'items': [second.pk], 'move_to': first.order,
            }, format='json')
            self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)

        self.assertLess(projected_first.order, projected_second.order)
        move()
        projected_first.refresh_from_db()
        projected_second.refresh_from_db()
        own.refresh_from_db()
        self.assertLess(projected_second.order, own.order)
        self.assertLess(own.order, projected_first.order)
        relativization.result.refresh_from_db()
        revision = relativization.result.time_update
        move()
        relativization.result.refresh_from_db()
        self.assertEqual(relativization.result.time_update, revision)

    def test_protect_projected_attributions_from_direct_removal(self):
        attribute = self.source.insert_last('X2', term_raw='Attribute', convention='An attribute.')
        source_attribution = {'container': self.base.pk, 'attribute': attribute.pk}
        Attribution.objects.create(container=self.base, attribute=attribute)
        relativization = self._relativize()
        container_id, attribute_id = relativization.projection['attribution'][0]
        managed = {'container': container_id, 'attribute': attribute_id}
        own = self._create_term(relativization.result_id, 'D99', 'X1', Constituenta.objects.get(pk=container_id))
        local = Attribution.objects.create(container_id=container_id, attribute=own)
        for endpoint, payload in (
            ('delete-attribution', managed),
            ('clear-attributions', {'target': container_id}),
        ):
            with self.subTest(endpoint=endpoint):
                response = self.client.patch(
                    f'/api/rsforms/{relativization.result_id}/{endpoint}', payload, format='json',
                )
                self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST, response.data)
                self.assertIn('container', response.data)
                self.assertTrue(Attribution.objects.filter(container_id=container_id, attribute_id=attribute_id).exists())
                self.assertTrue(Attribution.objects.filter(pk=local.pk).exists())

        response = self.client.patch(
            f'/api/rsforms/{self.source.model.pk}/delete-attribution', source_attribution, format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.assertFalse(Attribution.objects.filter(container_id=container_id, attribute_id=attribute_id).exists())
        self.assertTrue(Attribution.objects.filter(pk=local.pk).exists())

    def test_block_removing_relativization_source_replica_without_rewiring(self):
        replica = self.oss.create_replica(self.source_operation)
        relativization = self._relativize(source_operation=replica)
        for endpoint, target in (('delete-operation', self.source_operation), ('delete-replica', replica)):
            with self.subTest(endpoint=endpoint):
                response = self.client.patch(f'/api/oss/{self.oss.model.pk}/{endpoint}', {
                    'target': target.pk, 'layout': [],
                }, format='json')
                self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST, response.data)
                self.assertIn('target', response.data)
                self.assertTrue(relativization.getQ_arguments().filter(argument=replica).exists())

        response = self.client.patch(f'/api/oss/{self.oss.model.pk}/delete-replica', {
            'target': replica.pk, 'layout': [], 'keep_connections': True,
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.assertTrue(relativization.getQ_arguments().filter(argument=self.source_operation).exists())

    def test_clone_older_graph_with_detached_relativization_source(self):
        relativization = self._relativize()
        self.source_operation.delete()
        self.assertFalse(relativization.getQ_arguments().exists())

        clone = clone_oss(self.oss.model, self.user, {'title': 'Copy', 'alias': 'Copy', 'location': 'test'})
        operation = Operation.objects.get(oss=clone, operation_type=OperationType.RELATIVIZATION)
        self.assertNotEqual(operation.relativization_source_id, self.source.model.pk)
        target = Constituenta.objects.get(pk=operation.projection['target'])
        self.assertEqual(target.schema_id, operation.relativization_source_id)
        managed = self._row(operation, target, 'axis')
        self.assertEqual(managed.schema_id, operation.result_id)

    def test_inline_synthesis_cannot_substitute_a_managed_receiver_original(self):
        relativization = self._relativize()
        managed = self._row(relativization, self.base, 'carrier')
        before = list(Constituenta.objects.filter(schema_id=relativization.result_id).values_list('pk', flat=True))
        response = self.client.patch('/api/rsforms/inline-synthesis', {
            'receiver': relativization.result_id,
            'source': self.other.model.pk,
            'items': [self.other_base.pk],
            'substitutions': [{'original': managed.pk, 'substitution': self.other_base.pk}],
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST, response.data)
        self.assertEqual(
            list(Constituenta.objects.filter(schema_id=relativization.result_id).values_list('pk', flat=True)), before,
        )

    def test_reparent_stores_new_coordinates_and_other_edits_preserve_them(self):
        block = self.oss.create_block(title='Destination')
        relativization = self._relativize()
        old_node = OperationSchema.layoutQ(self.oss.model.pk).data[0]
        block_node = {'nodeID': f'b{block.pk}', 'x': 500, 'y': 500, 'width': 200, 'height': 140}
        position = {'x': 520, 'y': 540, 'width': 150, 'height': 40}
        details = {'title': 'Relative', 'alias': 'Relative', 'parent': block.pk}
        moved = self._relativize(
            existing=relativization, item_data=details, position=position, layout=[old_node, block_node],
        )
        self.assertEqual(moved.parent_id, block.pk)
        expected = [block_node, {'nodeID': old_node['nodeID'], **position}]
        self.assertEqual(OperationSchema.layoutQ(self.oss.model.pk).data, expected)
        self._relativize(existing=moved, item_data=details | {'title': 'A changed title'})
        self.assertEqual(OperationSchema.layoutQ(self.oss.model.pk).data, expected)


@skipUnlessDBFeature('has_select_for_update_nowait')
class TestConcurrentRelativization(TransactionTestCase):
    ''' Verify lock order on a database with independent row locks. '''

    def test_reconfiguration_waits_for_result_before_locking_operation(self):
        user = User.objects.create(username='Relativization editor')
        client = APIClient()
        client.force_authenticate(user=user)
        oss = OperationSchema.create(alias='OSS', title='Operations', owner=user)
        source = RSForm.create(alias='Source', title='Source', owner=user)
        target = source.insert_last('X1', term_raw='Vertices', convention='Vertices in the source.')
        source.model.refresh_from_db()
        source_operation = oss.create_operation(operation_type=OperationType.INPUT, result=source.model)
        url = f'/api/oss/{oss.model.pk}/create-relativization'
        data = {
            'source_operation': source_operation.pk,
            'source_time_update': source.model.time_update.isoformat(),
            'target': target.pk,
            'excluded': [],
            'locale': 'en',
            'context_name': 'context',
            'item_data': {'alias': 'Relative', 'title': 'Relative', 'parent': None},
            'layout': [],
            'position': {'x': 0, 'y': 0, 'width': 150, 'height': 40},
            'skip_review': True,
        }
        created = client.post(url, data, format='json')
        self.assertEqual(created.status_code, status.HTTP_201_CREATED, created.data)
        operation = Operation.objects.get(pk=created.data['new_operation'])
        result_id = operation.result_id
        generated_id = next(row['result'] for row in operation.projection['rows'] if row['role'] == 'carrier')
        waiting_for_result = Event()

        def observe_result_lock(execute, sql, params, many, context):
            if 'FOR UPDATE' in sql and 'library_libraryitem' in sql and result_id in (params or ()):
                waiting_for_result.set()
            return execute(sql, params, many, context)

        def reconfigure():
            thread_client = APIClient()
            thread_client.force_authenticate(user=user)
            with connection.execute_wrapper(observe_result_lock):
                try:
                    return thread_client.post(url, data | {'existing_operation': operation.pk}, format='json')
                finally:
                    connections.close_all()

        convention = 'A confirmed edit during reconfiguration.'
        with ThreadPoolExecutor(max_workers=1) as executor:
            with transaction.atomic():
                LibraryItem.objects.select_for_update().get(pk=result_id)
                future = executor.submit(reconfigure)
                self.assertTrue(waiting_for_result.wait(timeout=10), 'Reconfiguration did not lock the result row.')
                Operation.objects.select_for_update(nowait=True).get(pk=operation.pk)
                edited = client.patch(f'/api/rsforms/{result_id}/update-cst', {
                    'target': generated_id, 'item_data': {'convention': convention},
                }, format='json')
                self.assertEqual(edited.status_code, status.HTTP_200_OK, edited.data)
            saved = future.result(timeout=20)
        self.assertEqual(saved.status_code, status.HTTP_201_CREATED, saved.data)
        self.assertEqual(Constituenta.objects.get(pk=generated_id).convention, convention)
