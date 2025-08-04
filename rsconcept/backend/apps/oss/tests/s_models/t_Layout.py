''' Testing models: Layout. '''
from django.test import TestCase

from apps.library.models import LibraryItem
from apps.oss.models import Layout


class TestLayout(TestCase):
    ''' Testing Layout model. '''


    def setUp(self):
        self.library_item = LibraryItem.objects.create(alias='LIB1')
        self.layout = Layout.objects.create(
            oss=self.library_item,
            data=[{'x': 1, 'y': 2}]
        )


    def test_str(self):
        expected = f'Схема расположения {self.library_item.alias}'
        self.assertEqual(str(self.layout), expected)


    def test_update_data(self):
        new_data = [{'x': 10, 'y': 20}]
        Layout.update_data(self.library_item.id, new_data)
        self.layout.refresh_from_db()
        self.assertEqual(self.layout.data, new_data)


    def test_default_data(self):
        layout2 = Layout.objects.create(oss=self.library_item)
        self.assertEqual(layout2.data, [])


    def test_related_name_layout(self):
        layouts = self.library_item.layout.all()
        self.assertIn(self.layout, layouts)
