''' Testing API: agent operation schema (OSS) routes. '''
from unittest.mock import patch

from django.core.cache import cache
from rest_framework import status

from apps.agents.models import AgentActionLog, ApiKey
from apps.agents.services.oss_layout import OssLayoutPlanner
from apps.library.models import AccessPolicy, Editor, LibraryItem, LibraryItemType
from apps.oss.models import Argument, Block, Layout, Operation, OperationSchema, OperationType, Replica
from apps.rsform.models import Constituenta, RSForm
from shared.concurrency import EXPECTED_TIME_UPDATE_HEADER
from shared.EndpointTester import EndpointTester, decl_endpoint


def _node(node_id: str, x: float, y: float, width: float = 150, height: float = 40) -> dict:
    return {'nodeID': node_id, 'x': x, 'y': y, 'width': width, 'height': height}


class TestAgentOssApi(EndpointTester):
    ''' API-key routes that read and change an operation schema. '''

    def setUp(self):
        ''' Two input operations with schemas and a synthesis operation without a result. '''
        super().setUp()
        cache.clear()
        self.oss = OperationSchema.create(title='OSS', alias='OSS1', owner=self.user, location='/U')
        self.oss_id = self.oss.model.pk
        self.ks1 = RSForm.create(alias='KS1', title='Schema 1', owner=self.user, location='/U')
        self.ks1X1 = self.ks1.insert_last('X1', term_raw='X1_1', term_resolved='X1_1')
        self.ks2 = RSForm.create(alias='KS2', title='Schema 2', owner=self.user, location='/U')
        self.ks2X1 = self.ks2.insert_last('X1', term_raw='X1_2', term_resolved='X1_2')
        self.op1 = self.oss.create_operation(alias='1', operation_type=OperationType.INPUT, result=self.ks1.model)
        self.op2 = self.oss.create_operation(alias='2', operation_type=OperationType.INPUT, result=self.ks2.model)
        self.layout = [_node(f'o{self.op1.pk}', 0, 0), _node(f'o{self.op2.pk}', 200, 0)]
        self._store_layout(self.layout)

        _, self.secret = ApiKey.create_for_user(self.user, 'OssAgent')
        self.client.force_authenticate(user=None)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.secret}')

    def _store_layout(self, layout: list[dict]):
        stored = Layout.objects.get(oss=self.oss.model)
        stored.data = layout
        stored.save()

    def _layout(self) -> dict[str, dict]:
        return {node['nodeID']: node for node in Layout.objects.get(oss=self.oss.model).data}

    def _logged(self, action: str, code: int = status.HTTP_200_OK) -> bool:
        ''' Success rows name the OSS; refusals are logged before the item is known. '''
        rows = AgentActionLog.objects.filter(action=action, status_code=code)
        if code < 300:
            rows = rows.filter(item_id=self.oss_id)
        return rows.exists()

    @decl_endpoint('/api/agents/oss/{item}/details', method='get')
    def test_details(self):
        ''' Details carry operations and layout; private, foreign type and session are refused. '''
        response = self.executeOK(item=self.oss_id)
        self.assertEqual(response.data['alias'], 'OSS1')
        self.assertEqual([op['id'] for op in response.data['operations']], [self.op1.pk, self.op2.pk])
        self.assertEqual(len(response.data['layout']), 2)
        self.assertFalse(AgentActionLog.objects.exists())

        private = OperationSchema.create(
            title='Private', alias='P', owner=self.user2, access_policy=AccessPolicy.PRIVATE,
        )
        self.executeForbidden(item=private.model.pk)
        self.executeNotFound(item=self.ks1.model.pk)
        self.client.credentials()
        self.client.force_authenticate(user=self.user)
        self.executeForbidden(item=self.oss_id)

    @decl_endpoint('/api/agents/oss', method='post')
    def test_create_oss(self):
        ''' A new OSS has an empty layout; the shared library needs staff. '''
        response = self.executeCreated(data={'title': 'New', 'alias': 'N1', 'location': '/U'})
        item = LibraryItem.objects.get(pk=response.data['id'])
        self.assertEqual(item.item_type, LibraryItemType.OPERATION_SCHEMA)
        self.assertEqual(item.owner, self.user)
        self.assertEqual(Layout.objects.get(oss=item).data, [])
        self.assertEqual(response.data['operations'], [])
        self.assertTrue(AgentActionLog.objects.filter(action='oss.create', item_id=item.pk).exists())

        self.executeForbidden(data={'title': 'Lib', 'alias': 'L1', 'location': '/L'})

    @decl_endpoint('/api/agents/oss/{item}/create-schema', method='post')
    def test_create_schema_without_layout(self):
        ''' The stored layout is kept and the new input lands right of the free inputs. '''
        response = self.executeCreated(item=self.oss_id, data={
            'item_data': {'alias': '3', 'title': 'Third', 'description': '', 'parent': None},
        })
        new_id = response.data['new_operation']
        operation = Operation.objects.get(pk=new_id)
        self.assertEqual(operation.operation_type, OperationType.INPUT)
        self.assertIsNotNone(operation.result)
        layout = self._layout()
        self.assertEqual(layout[f'o{self.op1.pk}'], self.layout[0])
        self.assertEqual(layout[f'o{new_id}'], _node(f'o{new_id}', 380, 0))
        self.assertEqual(len(response.data['oss']['layout']), 3)
        self.assertTrue(self._logged('oss.create_schema', status.HTTP_201_CREATED))

    @decl_endpoint('/api/agents/oss/{item}/create-schema', method='post')
    def test_create_schema_position_without_size(self):
        ''' A partial position takes the default node size. '''
        response = self.executeCreated(item=self.oss_id, data={
            'item_data': {'alias': '3', 'title': '', 'description': '', 'parent': None},
            'position': {'x': 40, 'y': 300},
        })
        new_id = response.data['new_operation']
        self.assertEqual(self._layout()[f'o{new_id}'], _node(f'o{new_id}', 40, 300))

    @decl_endpoint('/api/agents/oss/{item}/create-synthesis', method='post')
    def test_create_synthesis_below_arguments(self):
        ''' Synthesis is executed and placed under its arguments; substitutions may be omitted. '''
        response = self.executeCreated(item=self.oss_id, data={
            'item_data': {'alias': '3', 'title': 'Synth', 'description': '', 'parent': None},
            'arguments': [self.op1.pk, self.op2.pk],
        })
        new_id = response.data['new_operation']
        operation = Operation.objects.get(pk=new_id)
        self.assertIsNotNone(operation.result)
        self.assertEqual(
            list(Argument.objects.filter(operation=operation).order_by('order').values_list('argument_id', flat=True)),
            [self.op1.pk, self.op2.pk],
        )
        self.assertEqual(Constituenta.objects.filter(schema=operation.result).count(), 2)
        self.assertEqual(self._layout()[f'o{new_id}'], _node(f'o{new_id}', 100, 100))
        self.assertTrue(self._logged('oss.create_synthesis', status.HTTP_201_CREATED))

    @decl_endpoint('/api/agents/oss/{item}/create-synthesis', method='post')
    def test_create_synthesis_rejects_foreign_argument(self):
        ''' An operation of another OSS is refused and the refusal is logged. '''
        other = OperationSchema.create(title='Other', alias='O', owner=self.user)
        foreign = other.create_operation(alias='X', operation_type=OperationType.INPUT)
        self.executeBadData(item=self.oss_id, data={
            'item_data': {'alias': '3', 'title': '', 'description': '', 'parent': None},
            'arguments': [self.op1.pk, foreign.pk],
        })
        self.assertEqual(Operation.objects.filter(oss=self.oss.model).count(), 2)
        self.assertTrue(self._logged('oss.create_synthesis', status.HTTP_400_BAD_REQUEST))

    @decl_endpoint('/api/agents/oss/{item}/create-block', method='post')
    def test_create_block_around_children(self):
        ''' A block made from operations wraps their nodes and adopts them. '''
        response = self.executeCreated(item=self.oss_id, data={
            'item_data': {'title': 'Inputs', 'description': '', 'parent': None},
            'children_operations': [self.op1.pk, self.op2.pk],
        })
        block_id = response.data['new_block']
        self.assertEqual(
            set(Operation.objects.filter(parent_id=block_id).values_list('pk', flat=True)),
            {self.op1.pk, self.op2.pk},
        )
        self.assertEqual(self._layout()[f'b{block_id}'], _node(f'b{block_id}', -20, -20, 390, 80))
        self.assertTrue(self._logged('oss.create_block', status.HTTP_201_CREATED))

    @decl_endpoint('/api/agents/oss/{item}/update-operation', method='patch')
    def test_update_operation_moves_node_into_block(self):
        ''' A new parent pulls the node inside the block, which grows to fit it. '''
        block = self.oss.create_block(title='B')
        self._store_layout(self.layout + [_node(f'b{block.pk}', 0, 200, 160, 100)])
        self.executeOK(item=self.oss_id, data={
            'target': self.op2.pk,
            'item_data': {'alias': '2b', 'title': 'Renamed', 'description': '', 'parent': block.pk},
        })
        self.op2.refresh_from_db()
        self.assertEqual(self.op2.parent_id, block.pk)
        self.assertEqual(self.op2.result.alias, '2b')
        layout = self._layout()
        self.assertEqual(layout[f'o{self.op2.pk}'], _node(f'o{self.op2.pk}', 20, 220))
        self.assertEqual(layout[f'b{block.pk}'], _node(f'b{block.pk}', 0, 200, 190, 100))
        self.assertTrue(self._logged('oss.update_operation'))

    @decl_endpoint('/api/agents/oss/{item}/update-operation', method='patch')
    def test_update_operation_without_parent_keeps_layout(self):
        ''' A rename does not touch the layout. '''
        self.executeOK(item=self.oss_id, data={
            'target': self.op1.pk,
            'item_data': {'alias': '1', 'title': 'Only title', 'description': ''},
        })
        self.assertEqual(list(self._layout().values()), self.layout)

    @decl_endpoint('/api/agents/oss/{item}/move-items', method='patch')
    def test_move_items_into_block(self):
        ''' Moved nodes are fitted into the destination block without overlapping. '''
        block = self.oss.create_block(title='B')
        self._store_layout(self.layout + [_node(f'b{block.pk}', 0, 200, 160, 100)])
        self.executeOK(item=self.oss_id, data={
            'operations': [self.op1.pk, self.op2.pk],
            'blocks': [],
            'destination': block.pk,
        })
        self.assertEqual(Operation.objects.filter(parent=block).count(), 2)
        layout = self._layout()
        first = layout[f'o{self.op1.pk}']
        second = layout[f'o{self.op2.pk}']
        self.assertEqual((first['x'], first['y']), (20, 220))
        self.assertNotEqual((second['x'], second['y']), (20, 220))
        self.assertGreaterEqual(layout[f'b{block.pk}']['height'], second['y'] + 40 + 20 - 200)

    @decl_endpoint('/api/agents/oss/{item}/delete-operation', method='patch')
    def test_delete_operation_drops_node(self):
        ''' The node goes; the rest of the stored layout stays. '''
        self.executeOK(item=self.oss_id, data={'target': self.op2.pk})
        self.assertFalse(Operation.objects.filter(pk=self.op2.pk).exists())
        self.assertEqual(list(self._layout().values()), [self.layout[0]])
        self.assertTrue(LibraryItem.objects.filter(pk=self.ks2.model.pk).exists())
        self.assertTrue(self._logged('oss.delete_operation'))

    @decl_endpoint('/api/agents/oss/{item}/delete-operation', method='patch')
    def test_delete_operation_with_schema(self):
        ''' ``delete_schema`` removes the owned result schema too. '''
        self.executeOK(item=self.oss_id, data={'target': self.op2.pk, 'delete_schema': True})
        self.assertFalse(LibraryItem.objects.filter(pk=self.ks2.model.pk).exists())

    @decl_endpoint('/api/agents/oss/{item}/create-replica', method='post')
    def test_create_and_delete_replica(self):
        ''' A replica sits next to its target and can be deleted again. '''
        response = self.executeCreated(item=self.oss_id, data={'target': self.op1.pk})
        replica_id = response.data['new_operation']
        self.assertTrue(Replica.objects.filter(replica_id=replica_id, original=self.op1).exists())
        self.assertEqual(self._layout()[f'o{replica_id}'], _node(f'o{replica_id}', 85, 30))

        self.client.patch(
            f'/api/agents/oss/{self.oss_id}/delete-replica',
            data={'target': replica_id},
            format='json',
        )
        self.assertFalse(Operation.objects.filter(pk=replica_id).exists())
        self.assertNotIn(f'o{replica_id}', self._layout())
        self.assertTrue(self._logged('oss.delete_replica'))

    @decl_endpoint('/api/agents/oss/{item}/clone-schema', method='post')
    def test_clone_schema(self):
        ''' The copy is an input with its own schema next to the source. '''
        response = self.executeCreated(item=self.oss_id, data={'source_operation': self.op1.pk})
        clone = Operation.objects.get(pk=response.data['new_operation'])
        self.assertEqual(clone.alias, '+1')
        self.assertNotEqual(clone.result_id, self.ks1.model.pk)
        self.assertEqual(Constituenta.objects.filter(schema_id=clone.result_id).count(), 1)
        self.assertIn(f'o{clone.pk}', self._layout())

    @decl_endpoint('/api/agents/oss/{item}/import-schema', method='post')
    def test_import_schema_access(self):
        ''' A readable schema is linked; a private foreign schema is refused. '''
        public = RSForm.create(alias='PUB', title='Public', owner=self.user2, access_policy=AccessPolicy.PUBLIC)
        response = self.executeCreated(item=self.oss_id, data={
            'item_data': {'alias': 'P', 'title': 'Imported', 'description': '', 'parent': None},
            'source': public.model.pk,
            'clone_source': False,
        })
        operation = Operation.objects.get(pk=response.data['new_operation'])
        self.assertEqual(operation.result_id, public.model.pk)

        private = RSForm.create(alias='PRV', title='Private', owner=self.user2, access_policy=AccessPolicy.PRIVATE)
        self.executeForbidden(item=self.oss_id, data={
            'item_data': {'alias': 'Q', 'title': '', 'description': '', 'parent': None},
            'source': private.model.pk,
            'clone_source': True,
        })

    @decl_endpoint('/api/agents/oss/{item}/execute-operation', method='post')
    def test_execute_operation(self):
        ''' An input cannot be executed; a synthesis without result can. '''
        self.executeBadData(item=self.oss_id, data={'target': self.op1.pk})
        self.assertTrue(self._logged('oss.execute_operation', status.HTTP_400_BAD_REQUEST))

        synthesis = self.oss.create_operation(alias='3', operation_type=OperationType.SYNTHESIS)
        self.oss.set_arguments(synthesis.pk, [self.op1, self.op2])
        self.executeOK(item=self.oss_id, data={'target': synthesis.pk})
        synthesis.refresh_from_db()
        self.assertIsNotNone(synthesis.result)
        self.assertTrue(self._logged('oss.execute_operation'))

    @decl_endpoint('/api/agents/oss/{item}/create-input', method='patch')
    def test_create_and_set_input(self):
        ''' An input without schema gets one; ``set-input`` with null detaches it. '''
        empty = self.oss.create_operation(alias='E', operation_type=OperationType.INPUT)
        response = self.executeOK(item=self.oss_id, data={'target': empty.pk})
        empty.refresh_from_db()
        self.assertEqual(response.data['new_schema']['id'], empty.result_id)
        self.executeBadData(item=self.oss_id, data={'target': empty.pk})

        self.client.patch(
            f'/api/agents/oss/{self.oss_id}/set-input',
            data={'target': empty.pk, 'input': None},
            format='json',
        )
        empty.refresh_from_db()
        self.assertIsNone(empty.result)
        self.assertTrue(self._logged('oss.set_input'))

    @decl_endpoint('/api/agents/oss/{item}/relocate-constituents', method='post')
    def test_relocate_constituents_returns_oss(self):
        ''' Moving a constituent down answers with the OSS, unlike the session route. '''
        synthesis = self.oss.create_operation(alias='3', operation_type=OperationType.SYNTHESIS)
        self.oss.set_arguments(synthesis.pk, [self.op1, self.op2])
        self.oss.execute_operation(synthesis)
        synthesis.refresh_from_db()
        extra = self.ks1.insert_last('X2')
        response = self.executeOK(item=self.oss_id, data={
            'destination': synthesis.result_id,
            'items': [extra.pk],
        })
        self.assertEqual(len(response.data['operations']), 3)
        self.assertFalse(Constituenta.objects.filter(pk=extra.pk).exists())
        self.assertTrue(self._logged('oss.relocate_constituents'))

    @decl_endpoint('/api/agents/oss/{item}/update-layout', method='patch')
    def test_update_layout(self):
        ''' The given layout replaces the stored one. '''
        layout = [_node(f'o{self.op1.pk}', 500, 500)]
        self.executeOK(item=self.oss_id, data={'data': layout})
        self.assertEqual(list(self._layout().values()), layout)
        self.assertTrue(self._logged('oss.update_layout'))

    @decl_endpoint('/api/agents/oss/{item}/update-block', method='patch')
    def test_block_update_and_delete(self):
        ''' A block moves into another block and deleting it lifts its children. '''
        outer = self.oss.create_block(title='Outer')
        inner = self.oss.create_block(title='Inner')
        self.op1.parent = inner
        self.op1.save(update_fields=['parent'])
        self._store_layout([
            _node(f'o{self.op1.pk}', 520, 20),
            _node(f'o{self.op2.pk}', 200, 0),
            _node(f'b{outer.pk}', 0, 200, 160, 100),
            _node(f'b{inner.pk}', 500, 0, 190, 80),
        ])
        self.executeOK(item=self.oss_id, data={
            'target': inner.pk,
            'item_data': {'title': 'Inner', 'description': '', 'parent': outer.pk},
        })
        inner.refresh_from_db()
        self.assertEqual(inner.parent_id, outer.pk)
        layout = self._layout()
        self.assertEqual((layout[f'b{inner.pk}']['x'], layout[f'b{inner.pk}']['y']), (20, 220))
        self.assertEqual((layout[f'o{self.op1.pk}']['x'], layout[f'o{self.op1.pk}']['y']), (40, 240))

        self.client.patch(
            f'/api/agents/oss/{self.oss_id}/delete-block',
            data={'target': inner.pk},
            format='json',
        )
        self.assertFalse(Block.objects.filter(pk=inner.pk).exists())
        self.op1.refresh_from_db()
        self.assertEqual(self.op1.parent_id, outer.pk)
        self.assertNotIn(f'b{inner.pk}', self._layout())

    @decl_endpoint('/api/agents/oss/{item}/create-schema', method='post')
    def test_edit_access(self):
        ''' Public is not editable, a shared OSS is, and read-only is not. '''
        payload = {'item_data': {'alias': 'N', 'title': '', 'description': '', 'parent': None}}
        public = OperationSchema.create(
            title='Public', alias='PUB', owner=self.user2, access_policy=AccessPolicy.PUBLIC,
        )
        self.executeForbidden(item=public.model.pk, data=payload)

        shared = OperationSchema.create(
            title='Shared', alias='SHR', owner=self.user2, access_policy=AccessPolicy.PROTECTED,
        )
        Editor.add(shared.model.pk, self.user.pk)
        self.executeCreated(item=shared.model.pk, data=payload)

        self.oss.model.read_only = True
        self.oss.model.save(update_fields=['read_only'])
        self.executeForbidden(item=self.oss_id, data=payload)
        self.executeNotFound(item=self.ks1.model.pk, data=payload)

    @decl_endpoint('/api/agents/oss/{item}/delete-operation', method='patch')
    def test_stale_concurrency_token(self):
        ''' A stale update time leaves the operation in place. '''
        self.oss.model.refresh_from_db()
        stale = self.oss.model.time_update.isoformat().replace('+00:00', 'Z')
        self.oss.model.save(update_fields=['time_update'])
        self.executeConflict(
            item=self.oss_id,
            data={'target': self.op2.pk},
            headers={EXPECTED_TIME_UPDATE_HEADER: stale},
        )
        self.assertTrue(Operation.objects.filter(pk=self.op2.pk).exists())
        self.assertTrue(self._logged('oss.delete_operation', status.HTTP_409_CONFLICT))

    @decl_endpoint('/api/agents/oss/{item}/create-schema', method='post')
    def test_failed_log_rolls_back(self):
        ''' A change is not kept when its action-log row cannot be written. '''
        with patch('apps.agents.views.base.log_agent_action', side_effect=RuntimeError('log down')):
            with self.assertRaises(RuntimeError):
                self.client.post(
                    f'/api/agents/oss/{self.oss_id}/create-schema',
                    data={'item_data': {'alias': 'N', 'title': '', 'description': '', 'parent': None}},
                    format='json',
                )
        self.assertEqual(Operation.objects.filter(oss=self.oss.model).count(), 2)
        self.assertEqual(len(self._layout()), 2)

    def test_heavy_routes(self):
        ''' Routes that create a conceptual schema use the heavy hourly cap. '''
        from apps.agents import views  # pylint: disable=import-outside-toplevel

        heavy = {
            views.AgentOssCreateView,
            views.AgentOssCreateSchemaView,
            views.AgentOssImportSchemaView,
            views.AgentOssCloneSchemaView,
            views.AgentOssCreateSynthesisView,
            views.AgentOssCreateInputView,
            views.AgentOssExecuteOperationView,
        }
        for view in heavy:
            self.assertTrue(view.agent_heavy, view.__name__)
        self.assertFalse(views.AgentOssCreateReplicaView.agent_heavy)
        self.assertFalse(views.AgentOssMoveItemsView.agent_heavy)


class TestOssLayoutPlanner(EndpointTester):
    ''' Server-side placement mirrors the UI layout rules. '''

    def setUp(self):
        super().setUp()
        self.oss = OperationSchema.create(title='OSS', alias='L', owner=self.user)

    def test_first_operation_at_origin(self):
        ''' An empty OSS keeps the initial position. '''
        planner = OssLayoutPlanner(self.oss.model, [])
        result = planner.new_operation_position({'x': 0, 'y': 0, 'width': 150, 'height': 40}, None)
        self.assertEqual((result['x'], result['y']), (0, 0))

    def test_operation_avoids_overlap_in_parent(self):
        ''' A second operation in a block shifts until it no longer overlaps. '''
        block = self.oss.create_block(title='B')
        first = self.oss.create_operation(alias='1', operation_type=OperationType.INPUT, parent=block)
        layout = [_node(f'b{block.pk}', 0, 0, 160, 100), _node(f'o{first.pk}', 20, 20)]
        planner = OssLayoutPlanner(self.oss.model, layout)
        result = planner.new_operation_position({'x': 0, 'y': 0, 'width': 150, 'height': 40}, block.pk)
        self.assertEqual((result['x'], result['y']), (80, 80))
        self.assertEqual((layout[0]['width'], layout[0]['height']), (250, 140))

    def test_change_parent_to_root_moves_descendants(self):
        ''' A block leaving its parent takes its children along. '''
        outer = self.oss.create_block(title='Outer')
        inner = self.oss.create_block(title='Inner', parent=outer)
        child = self.oss.create_operation(alias='1', operation_type=OperationType.INPUT, parent=inner)
        root = self.oss.create_operation(alias='2', operation_type=OperationType.INPUT)
        layout = [
            _node(f'b{outer.pk}', 0, 0, 300, 200),
            _node(f'b{inner.pk}', 20, 20, 190, 80),
            _node(f'o{child.pk}', 40, 40),
            _node(f'o{root.pk}', 20, 20),
        ]
        planner = OssLayoutPlanner(self.oss.model, layout)
        planner.change_parent(f'b{inner.pk}', None)
        dx = layout[1]['x'] - 20
        dy = layout[1]['y'] - 20
        self.assertNotEqual((dx, dy), (0, 0))
        self.assertEqual((layout[2]['x'], layout[2]['y']), (40 + dx, 40 + dy))
