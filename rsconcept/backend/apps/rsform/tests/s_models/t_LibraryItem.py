''' Testing models: LibraryItem. '''
from django.test import TestCase

from apps.rsform.models import (
    AccessPolicy,
    LibraryItem,
    LibraryItemType,
    LocationHead,
    Subscription,
    User,
    validate_location
)


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
        self.assertEqual(item.get_absolute_url(), f'/api/library/{item.pk}')


    def test_create_default(self):
        item = LibraryItem.objects.create(item_type=LibraryItemType.RSFORM, title='Test')
        self.assertIsNone(item.owner)
        self.assertEqual(item.title, 'Test')
        self.assertEqual(item.alias, '')
        self.assertEqual(item.comment, '')
        self.assertEqual(item.visible, True)
        self.assertEqual(item.read_only, False)
        self.assertEqual(item.access_policy, AccessPolicy.PUBLIC)
        self.assertEqual(item.location, LocationHead.USER)


    def test_create(self):
        item = LibraryItem.objects.create(
            item_type=LibraryItemType.RSFORM,
            title='Test',
            owner=self.user1,
            alias='KS1',
            comment='Test comment',
            location=LocationHead.COMMON
        )
        self.assertEqual(item.owner, self.user1)
        self.assertEqual(item.title, 'Test')
        self.assertEqual(item.alias, 'KS1')
        self.assertEqual(item.comment, 'Test comment')
        self.assertEqual(item.location, LocationHead.COMMON)
        self.assertTrue(Subscription.objects.filter(user=item.owner, item=item).exists())


class TestLocation(TestCase):
    ''' Testing Location model. '''

    def test_validate_location(self):
        self.assertFalse(validate_location(''))
        self.assertFalse(validate_location('/A'))
        self.assertFalse(validate_location('U/U'))
        self.assertFalse(validate_location('/U/'))
        self.assertFalse(validate_location('/U/user@mail'))
        self.assertFalse(validate_location('/U/u\\asdf'))
        self.assertFalse(validate_location('/U/ asdf'))
        self.assertFalse(validate_location('/User'))
        self.assertFalse(validate_location('//'))
        self.assertFalse(validate_location('/S/1/'))
        self.assertFalse(validate_location('/S/1 '))
        self.assertFalse(validate_location('/S/1/2 /3'))
        self.assertFalse(validate_location('/S/-'))
        self.assertFalse(validate_location('/S/1-'))

        self.assertTrue(validate_location('/P'))
        self.assertTrue(validate_location('/L'))
        self.assertTrue(validate_location('/U'))
        self.assertTrue(validate_location('/S'))
        self.assertTrue(validate_location('/S/1'))
        self.assertTrue(validate_location('/S/1-2'))
        self.assertTrue(validate_location('/S/20210101 asdf-a/2'))
        self.assertTrue(validate_location('/S/12'))
        self.assertTrue(validate_location('/S/12/3'))
        self.assertTrue(validate_location('/S/Вася шофер'))
        self.assertTrue(validate_location('/S/1/!asdf/тест тест'))
