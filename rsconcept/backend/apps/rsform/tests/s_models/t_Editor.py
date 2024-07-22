''' Testing models: Editor. '''
from django.test import TestCase

from apps.rsform.models import Editor, LibraryItemType, RSForm, User


class TestEditor(TestCase):
    ''' Testing Editor model. '''

    def setUp(self):
        self.user1 = User.objects.create(username='User1')
        self.user2 = User.objects.create(username='User2')
        self.item = RSForm.objects.create(
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
        self.assertTrue(Editor.add(self.item, self.user1))
        self.assertEqual(len(self.item.editors()), 1)
        self.assertTrue(self.user1 in self.item.editors())

        self.assertFalse(Editor.add(self.item, self.user1))
        self.assertEqual(len(self.item.editors()), 1)

        self.assertTrue(Editor.add(self.item, self.user2))
        self.assertEqual(len(self.item.editors()), 2)
        self.assertTrue(self.user1 in self.item.editors())
        self.assertTrue(self.user2 in self.item.editors())

        self.user1.delete()
        self.assertEqual(len(self.item.editors()), 1)


    def test_remove_editor(self):
        self.assertFalse(Editor.remove(self.item, self.user1))
        Editor.add(self.item, self.user1)
        Editor.add(self.item, self.user2)
        self.assertEqual(len(self.item.editors()), 2)

        self.assertTrue(Editor.remove(self.item, self.user1))
        self.assertEqual(len(self.item.editors()), 1)
        self.assertTrue(self.user2 in self.item.editors())

        self.assertFalse(Editor.remove(self.item, self.user1))


    def test_set_editors(self):
        Editor.set(self.item, [self.user1])
        self.assertEqual(self.item.editors(), [self.user1])

        Editor.set(self.item, [self.user1, self.user1])
        self.assertEqual(self.item.editors(), [self.user1])

        Editor.set(self.item, [])
        self.assertEqual(self.item.editors(), [])

        Editor.set(self.item, [self.user1, self.user2])
        self.assertEqual(set(self.item.editors()), set([self.user1, self.user2]))
