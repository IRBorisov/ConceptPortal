''' Testing models: Operation. '''
from django.test import TestCase

from apps.oss.models import LibraryItem, LibraryItemType, Operation, OperationSchema, OperationType
from apps.rsform.models import RSForm


class TestOperation(TestCase):
    ''' Testing Operation model. '''

    def setUp(self):
        self.oss = OperationSchema.objects.create(alias='T1')
        self.operation = Operation.objects.create(
            oss=self.oss,
            alias='KS1'
        )


    def test_str(self):
        testStr = 'Операция KS1'
        self.assertEqual(str(self.operation), testStr)


    def test_create_default(self):
        self.assertEqual(self.operation.oss, self.oss)
        self.assertEqual(self.operation.operation_type, OperationType.INPUT)
        self.assertEqual(self.operation.result, None)
        self.assertEqual(self.operation.alias, 'KS1')
        self.assertEqual(self.operation.title, '')
        self.assertEqual(self.operation.comment, '')
        self.assertEqual(self.operation.sync_text, True)
        self.assertEqual(self.operation.position_x, 0)
        self.assertEqual(self.operation.position_y, 0)


    def test_sync_from_result(self):
        schema = RSForm.objects.create(alias=self.operation.alias)
        self.operation.result = schema
        self.operation.save()

        schema.alias = 'KS2'
        schema.comment = 'Comment'
        schema.title = 'Title'
        schema.save()
        self.operation.refresh_from_db()

        self.assertEqual(self.operation.result, schema)
        self.assertEqual(self.operation.alias, schema.alias)
        self.assertEqual(self.operation.title, schema.title)
        self.assertEqual(self.operation.comment, schema.comment)

        self.operation.sync_text = False
        self.operation.save()

        schema.alias = 'KS3'
        schema.save()
        self.operation.refresh_from_db()
        self.assertEqual(self.operation.result, schema)
        self.assertNotEqual(self.operation.alias, schema.alias)

    def test_sync_from_library_item(self):
        schema = LibraryItem.objects.create(alias=self.operation.alias, item_type=LibraryItemType.RSFORM)
        self.operation.result = schema
        self.operation.save()

        schema.alias = 'KS2'
        schema.comment = 'Comment'
        schema.title = 'Title'
        schema.save()
        self.operation.refresh_from_db()

        self.assertEqual(self.operation.result, schema)
        self.assertEqual(self.operation.alias, schema.alias)
        self.assertEqual(self.operation.title, schema.title)
        self.assertEqual(self.operation.comment, schema.comment)
