''' Testing models: Editor. '''
from django.test import TestCase

from apps.library.models import Editor, LibraryItem, LibraryItemType
from apps.users.models import User


class TestEditor(TestCase):
    ''' Testing Editor model. '''

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
        editors = list(Editor.objects.filter(item=self.item))
        self.assertEqual(len(editors), 0)


    def test_str(self):
        testStr = 'КС1: User2'
        item = Editor.objects.create(
            editor=self.user2,
            item=self.item
        )
        self.assertEqual(str(item), testStr)


    def test_add_editor(self):
        self.assertTrue(Editor.add(self.item.pk, self.user1.pk))
        self.assertEqual(self.item.getQ_editors().count(), 1)
        self.assertTrue(self.user1 in list(self.item.getQ_editors()))

        self.assertFalse(Editor.add(self.item.pk, self.user1.pk))
        self.assertEqual(self.item.getQ_editors().count(), 1)

        self.assertTrue(Editor.add(self.item.pk, self.user2.pk))
        self.assertEqual(self.item.getQ_editors().count(), 2)
        self.assertTrue(self.user1 in self.item.getQ_editors())
        self.assertTrue(self.user2 in self.item.getQ_editors())

        self.user1.delete()
        self.assertEqual(self.item.getQ_editors().count(), 1)


    def test_remove_editor(self):
        self.assertFalse(Editor.remove(self.item.pk, self.user1.pk))
        Editor.add(self.item.pk, self.user1.pk)
        Editor.add(self.item.pk, self.user2.pk)
        self.assertEqual(self.item.getQ_editors().count(), 2)

        self.assertTrue(Editor.remove(self.item.pk, self.user1.pk))
        self.assertEqual(self.item.getQ_editors().count(), 1)
        self.assertTrue(self.user2 in self.item.getQ_editors())

        self.assertFalse(Editor.remove(self.item.pk, self.user1.pk))


    def test_set_editors(self):
        Editor.set(self.item.pk, [self.user1.pk])
        self.assertEqual(list(self.item.getQ_editors()), [self.user1])

        Editor.set(self.item.pk, [self.user1.pk, self.user1.pk])
        self.assertEqual(list(self.item.getQ_editors()), [self.user1])

        Editor.set(self.item.pk, [])
        self.assertEqual(list(self.item.getQ_editors()), [])

        Editor.set(self.item.pk, [self.user1.pk, self.user2.pk])
        self.assertEqual(set(self.item.getQ_editors()), set([self.user1, self.user2]))

    def test_set_editors_return_diff(self):
        added, deleted = Editor.set_and_return_diff(self.item.pk, [self.user1.pk])
        self.assertEqual(added, [self.user1.pk])
        self.assertEqual(deleted, [])
        self.assertEqual(list(self.item.getQ_editors()), [self.user1])

        added, deleted = Editor.set_and_return_diff(self.item.pk, [self.user1.pk, self.user1.pk])
        self.assertEqual(added, [])
        self.assertEqual(deleted, [])
        self.assertEqual(list(self.item.getQ_editors()), [self.user1])

        added, deleted = Editor.set_and_return_diff(self.item.pk, [])
        self.assertEqual(added, [])
        self.assertEqual(deleted, [self.user1.pk])
        self.assertEqual(list(self.item.getQ_editors()), [])

        added, deleted = Editor.set_and_return_diff(self.item.pk, [self.user1.pk, self.user2.pk])
        self.assertEqual(added, [self.user1.pk, self.user2.pk])
        self.assertEqual(deleted, [])
        self.assertEqual(set(self.item.getQ_editors()), set([self.user1, self.user2]))
