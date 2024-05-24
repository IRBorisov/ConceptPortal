''' Testing models: LibraryItem. '''
from django.test import TestCase

from apps.rsform.models import LibraryItem, LibraryItemType, Subscription, User


class TestLibraryItem(TestCase):
    ''' Testing LibraryItem model. '''

    def setUp(self):
        self.user1 = User.objects.create(username='User1')
        self.user2 = User.objects.create(username='User2')


    def test_str(self):
        testStr = 'Test123'
        item = LibraryItem.objects.create(
            item_type=LibraryItemType.RSFORM,
            title='Title',
            owner=self.user1,
            alias=testStr
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
