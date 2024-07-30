''' Testing models: Operation. '''
from django.test import TestCase

from apps.library.models import LibraryItem, LibraryItemType
from apps.oss.models import Operation, OperationSchema, OperationType
from apps.rsform.models import RSForm


class TestOperation(TestCase):
    ''' Testing Operation model. '''

    def setUp(self):
        self.oss = OperationSchema.create(alias='T1')
        self.operation = Operation.objects.create(
            oss=self.oss.model,
            alias='KS1'
        )


    def test_str(self):
        testStr = 'Операция KS1'
        self.assertEqual(str(self.operation), testStr)


    def test_create_default(self):
        self.assertEqual(self.operation.oss, self.oss.model)
        self.assertEqual(self.operation.operation_type, OperationType.INPUT)
        self.assertEqual(self.operation.result, None)
        self.assertEqual(self.operation.alias, 'KS1')
        self.assertEqual(self.operation.title, '')
        self.assertEqual(self.operation.comment, '')
        self.assertEqual(self.operation.position_x, 0)
        self.assertEqual(self.operation.position_y, 0)


    def test_sync_from_result(self):
        schema = RSForm.create(alias=self.operation.alias)
        self.operation.result = schema.model
        self.operation.save()

        schema.model.alias = 'KS2'
        schema.model.comment = 'Comment'
        schema.model.title = 'Title'
        schema.save()
        self.operation.refresh_from_db()

        self.assertEqual(self.operation.result, schema.model)
        self.assertEqual(self.operation.alias, schema.model.alias)
        self.assertEqual(self.operation.title, schema.model.title)
        self.assertEqual(self.operation.comment, schema.model.comment)

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
