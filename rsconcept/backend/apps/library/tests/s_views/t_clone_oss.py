''' Testing API: OSS clone via library endpoint. '''
from django.core.cache import cache
from rest_framework import status

from apps.library.models import AccessPolicy, Editor, LibraryItem
from apps.oss.models import (
    Argument,
    Block,
    Layout,
    Operation,
    OperationSchema,
    OperationType,
    Replica,
    Substitution
)
from apps.rsform.models import RSForm
from shared.EndpointTester import EndpointTester, decl_endpoint


class TestLibraryCloneOss(EndpointTester):
    ''' Testing POST /api/library/{id}/clone for operation schemas. '''


    def setUp(self):
        super().setUp()
        cache.clear()
        self.owned = OperationSchema.create(
            title='OSS Source',
            alias='OSS1',
            owner=self.user,
            location='/U/clone-src'
        )
        self.unowned = OperationSchema.create(title='OSS Other', alias='OSS2', location='/U/other')
        self.invalid_id = self.unowned.model.pk + 1337


    def _clone_payload(self, location: str = '/U/clone-dst', title: str = 'OSS Clone') -> dict:
        return {
            'items': [],
            'item_data': {
                'title': title,
                'alias': 'OSS_CLONE',
                'description': 'cloned',
                'visible': True,
                'access_policy': AccessPolicy.PUBLIC,
                'location': location
            }
        }


    def populate_graph(self):
        self.block = self.owned.create_block(title='Block A')
        self.ks1 = RSForm.create(
            alias='KS1',
            title='Schema 1',
            owner=self.user,
            location=self.owned.model.location
        )
        self.ks1_x1 = self.ks1.insert_last('X1', term_raw='a', term_resolved='a')
        self.ks2 = RSForm.create(
            alias='KS2',
            title='Schema 2',
            owner=self.user2,
            location='/U/external'
        )
        self.ks2_x1 = self.ks2.insert_last('X2', term_raw='b', term_resolved='b')

        self.operation1 = self.owned.create_operation(
            alias='op1',
            operation_type=OperationType.INPUT,
            result=self.ks1.model,
            parent=self.block
        )
        self.operation2 = self.owned.create_operation(
            alias='op2',
            operation_type=OperationType.INPUT,
            result=self.ks2.model
        )
        self.operation3 = self.owned.create_operation(
            alias='syn',
            operation_type=OperationType.SYNTHESIS
        )
        self.replica_op = self.owned.create_replica(self.operation1)

        self.owned.set_arguments(self.operation3.pk, [self.operation1, self.operation2])
        self.owned.set_substitutions(self.operation3.pk, [{
            'original': self.ks1_x1,
            'substitution': self.ks2_x1
        }])

        self.layout_data = [
            {'nodeID': f'b{self.block.pk}', 'x': 1, 'y': 2, 'width': 300, 'height': 200},
            {'nodeID': f'o{self.operation1.pk}', 'x': 10, 'y': 20, 'width': 150, 'height': 40},
            {'nodeID': f'o{self.operation2.pk}', 'x': 30, 'y': 40, 'width': 150, 'height': 40},
            {'nodeID': f'o{self.operation3.pk}', 'x': 50, 'y': 60, 'width': 150, 'height': 40},
            {'nodeID': f'o{self.replica_op.pk}', 'x': 70, 'y': 80, 'width': 150, 'height': 40},
        ]
        layout = OperationSchema.layoutQ(self.owned.model.pk)
        layout.data = self.layout_data
        layout.save()

        Editor.add(self.owned.model.pk, self.user2.pk)


    @decl_endpoint('/api/library/{item}/clone', method='post')
    def test_clone_oss_graph(self):
        self.populate_graph()
        data = self._clone_payload()

        self.executeNotFound(data, item=self.invalid_id)

        response = self.executeCreated(data, item=self.owned.model.pk)
        clone_id = response.data['id']
        self.assertEqual(response.data['item_type'], 'oss')
        self.assertEqual(response.data['location'], '/U/clone-dst')
        self.assertEqual(response.data['owner'], self.user.pk)

        clone_ops = list(Operation.objects.filter(oss_id=clone_id).order_by('pk'))
        self.assertEqual(len(clone_ops), 4)
        replica_rows = Replica.objects.filter(original__oss_id=clone_id)
        self.assertEqual(replica_rows.count(), 1)
        replica_row = replica_rows.first()
        assert replica_row is not None
        replica_operation = Operation.objects.get(pk=replica_row.replica_id)
        original_operation = Operation.objects.get(pk=replica_row.original_id)
        self.assertEqual(replica_operation.result_id, original_operation.result_id)
        self.assertEqual(replica_operation.operation_type, OperationType.REPLICA)

        self.assertEqual(Argument.objects.filter(operation__oss_id=clone_id).count(), 2)
        self.assertEqual(Substitution.objects.filter(operation__oss_id=clone_id).count(), 1)
        self.assertEqual(Block.objects.filter(oss_id=clone_id).count(), 1)

        result_ids = {op.result_id for op in clone_ops if op.result_id}
        self.assertEqual(len(result_ids), 2)
        for schema_id in result_ids:
            schema = LibraryItem.objects.get(pk=schema_id)
            self.assertEqual(schema.location, '/U/clone-dst')
            self.assertNotEqual(schema.pk, self.ks1.model.pk)
            self.assertNotEqual(schema.pk, self.ks2.model.pk)

        clone_layout = Layout.objects.get(oss_id=clone_id).data
        node_ids = {node['nodeID'] for node in clone_layout}
        self.assertEqual(len(node_ids), 5)
        for node in clone_layout:
            if node['nodeID'].startswith('o'):
                op_id = int(node['nodeID'][1:])
                self.assertTrue(Operation.objects.filter(pk=op_id, oss_id=clone_id).exists())


    @decl_endpoint('/api/library/{item}/clone', method='post')
    def test_clone_rejects_same_location(self):
        self.populate_graph()
        data = self._clone_payload(location=self.owned.model.location)
        self.executeBadData(data, item=self.owned.model.pk)


    @decl_endpoint('/api/library/{item}/clone', method='post')
    def test_clone_forbidden_without_read_access(self):
        private_other = OperationSchema.create(title='Private OSS', alias='PO', owner=self.user2)
        private_other.model.access_policy = AccessPolicy.PRIVATE
        private_other.model.save()
        data = self._clone_payload()
        self.executeForbidden(data, item=private_other.model.pk)


    @decl_endpoint('/api/library/{item}/clone', method='post')
    def test_clone_throttling(self):
        self.populate_graph()
        cache.clear()
        data = self._clone_payload(location='/U/throttle-a')
        self.executeCreated(data, item=self.owned.model.pk)
        data2 = self._clone_payload(location='/U/throttle-b', title='OSS Clone 2')
        self.executeCreated(data2, item=self.owned.model.pk)
        response = self.execute(data2)
        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
