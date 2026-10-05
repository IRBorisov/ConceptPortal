''' Regression: library create, update, and destroy commit together or not at all. '''
from unittest.mock import patch

from apps.library.models import LibraryItem, LibraryItemType, LocationHead
from apps.oss.models import Operation, OperationType
from shared.EndpointTester import EndpointTester


class TestLibraryAtomicity(EndpointTester):
    ''' A failure midway through a library mutation rolls the whole change back. '''

    def test_create_oss_rolls_back_when_layout_fails(self):
        payload = {
            'item_type': LibraryItemType.OPERATION_SCHEMA,
            'title': 'Atomic OSS',
            'alias': 'atomic-oss',
        }
        with patch(
            'apps.library.views.library.Layout.objects.create',
            side_effect=RuntimeError('layout failed'),
        ):
            with self.assertRaises(RuntimeError):
                self.client.post('/api/library', data=payload, format='json')
        self.assertFalse(LibraryItem.objects.filter(alias='atomic-oss').exists())

    def test_update_rolls_back_when_operation_sync_fails(self):
        schema = LibraryItem.objects.create(
            item_type=LibraryItemType.RSFORM,
            title='Schema',
            alias='ATOM-S',
            owner=self.user,
        )
        oss = LibraryItem.objects.create(
            item_type=LibraryItemType.OPERATION_SCHEMA,
            title='Host',
            alias='HOST',
            owner=self.user,
        )
        Operation.objects.create(
            oss=oss,
            result=schema,
            alias='old-alias',
            title='old-title',
            description='old-description',
            operation_type=OperationType.INPUT,
        )
        with patch(
            'apps.library.views.library.Operation.objects.bulk_update',
            side_effect=RuntimeError('sync failed'),
        ):
            with self.assertRaises(RuntimeError):
                self.client.patch(
                    f'/api/library/{schema.pk}',
                    data={'title': 'New Title'},
                    format='json',
                )
        schema.refresh_from_db()
        self.assertEqual(schema.title, 'Schema')

    def test_destroy_oss_rolls_back_when_owned_schema_cleanup_fails(self):
        oss = LibraryItem.objects.create(
            item_type=LibraryItemType.OPERATION_SCHEMA,
            title='Doomed OSS',
            alias='DOOM',
            owner=self.user,
            location=LocationHead.USER,
        )
        schema = LibraryItem.objects.create(
            item_type=LibraryItemType.RSFORM,
            title='Owned schema',
            alias='OWN',
            owner=self.user,
            location=LocationHead.USER,
        )
        Operation.objects.create(
            oss=oss,
            result=schema,
            operation_type=OperationType.INPUT,
        )
        with patch(
            'apps.library.views.library.PropagationFacade.before_delete_schema',
            side_effect=RuntimeError('cleanup failed'),
        ):
            with self.assertRaises(RuntimeError):
                self.client.delete(f'/api/library/{oss.pk}')
        self.assertTrue(LibraryItem.objects.filter(pk=oss.pk).exists())
        self.assertTrue(LibraryItem.objects.filter(pk=schema.pk).exists())
