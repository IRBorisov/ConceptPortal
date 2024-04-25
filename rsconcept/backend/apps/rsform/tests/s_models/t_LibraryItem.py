''' Testing models: LibraryItem. '''
from django.test import TestCase

from apps.rsform.models import (
    LibraryItem, LibraryItemType, Subscription,
    User
)


class TestLibraryItem(TestCase):
    ''' Testing LibraryItem model. '''
    def setUp(self):
        self.user1 = User.objects.create(username='User1')
        self.user2 = User.objects.create(username='User2')
        self.assertNotEqual(self.user1, self.user2)


    def test_str(self):
        testStr = 'Test123'
        item = LibraryItem.objects.create(
            item_type=LibraryItemType.RSFORM,
            title=testStr,
            owner=self.user1,
            alias='КС1'
        )
        self.assertEqual(str(item), testStr)


    def test_url(self):
        testStr = 'Test123'
        item = LibraryItem.objects.create(
            item_type=LibraryItemType.RSFORM,
            title=testStr,
            owner=self.user1,
            alias='КС1'
        )
        self.assertEqual(item.get_absolute_url(), f'/api/library/{item.id}')


    def test_create_default(self):
        item = LibraryItem.objects.create(item_type=LibraryItemType.RSFORM, title='Test')
        self.assertIsNone(item.owner)
        self.assertEqual(item.title, 'Test')
        self.assertEqual(item.alias, '')
        self.assertEqual(item.comment, '')
        self.assertEqual(item.is_common, False)
        self.assertEqual(item.is_canonical, False)


    def test_create(self):
        item = LibraryItem.objects.create(
            item_type=LibraryItemType.RSFORM,
            title='Test',
            owner=self.user1,
            alias='KS1',
            comment='Test comment',
            is_common=True,
            is_canonical=True
        )
        self.assertEqual(item.owner, self.user1)
        self.assertEqual(item.title, 'Test')
        self.assertEqual(item.alias, 'KS1')
        self.assertEqual(item.comment, 'Test comment')
        self.assertEqual(item.is_common, True)
        self.assertEqual(item.is_canonical, True)
        self.assertTrue(Subscription.objects.filter(user=item.owner, item=item).exists())


    def test_subscribe(self):
        item = LibraryItem.objects.create(item_type=LibraryItemType.RSFORM, title='Test')
        self.assertEqual(len(item.subscribers()), 0)

        self.assertTrue(Subscription.subscribe(self.user1, item))
        self.assertEqual(len(item.subscribers()), 1)
        self.assertTrue(self.user1 in item.subscribers())

        self.assertFalse(Subscription.subscribe(self.user1, item))
        self.assertEqual(len(item.subscribers()), 1)

        self.assertTrue(Subscription.subscribe(self.user2, item))
        self.assertEqual(len(item.subscribers()), 2)
        self.assertTrue(self.user1 in item.subscribers())
        self.assertTrue(self.user2 in item.subscribers())

        self.user1.delete()
        self.assertEqual(len(item.subscribers()), 1)


    def test_unsubscribe(self):
        item = LibraryItem.objects.create(item_type=LibraryItemType.RSFORM, title='Test')
        self.assertFalse(Subscription.unsubscribe(self.user1, item))
        Subscription.subscribe(self.user1, item)
        Subscription.subscribe(self.user2, item)
        self.assertEqual(len(item.subscribers()), 2)

        self.assertTrue(Subscription.unsubscribe(self.user1, item))
        self.assertEqual(len(item.subscribers()), 1)
        self.assertTrue(self.user2 in item.subscribers())

        self.assertFalse(Subscription.unsubscribe(self.user1, item))
