''' Testing models: Subscription. '''
from django.test import TestCase

from apps.rsform.models import LibraryItem, LibraryItemType, Subscription, User


class TestSubscription(TestCase):
    ''' Testing Subscription model. '''

    def setUp(self):
        self.user1 = User.objects.create(username='User1')
        self.user2 = User.objects.create(username='User2')
        self.item = LibraryItem.objects.create(
            item_type=LibraryItemType.RSFORM,
            title='Test',
            alias='КС1',
            owner=self.user1
        )


    def test_default(self):
        subs = list(Subscription.objects.filter(item=self.item))
        self.assertEqual(len(subs), 1)
        self.assertEqual(subs[0].item, self.item)
        self.assertEqual(subs[0].user, self.user1)


    def test_str(self):
        testStr = 'User2 -> КС1'
        item = Subscription.objects.create(
            user=self.user2,
            item=self.item
        )
        self.assertEqual(str(item), testStr)


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
