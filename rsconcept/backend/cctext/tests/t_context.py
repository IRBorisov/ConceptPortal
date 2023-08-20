''' Unit tests: context. '''
import unittest

from cctext.context import TermForm, Entity, TermContext

class TestEntity(unittest.TestCase):
    '''Test Entity termform access.'''
    def setUp(self):
        self.alias = 'X1'
        self.nominal = 'человек'
        self.text1 = 'test1'
        self.form1 = 'sing,datv'
        self.entity = Entity(self.alias, self.nominal, [TermForm(self.text1, self.form1)])

    def test_attributes(self):
        self.assertEqual(self.entity.alias, self.alias)
        self.assertEqual(self.entity.get_nominal(), self.nominal)
        self.assertEqual(self.entity.manual, [TermForm(self.text1, self.form1)])

    def test_get_form(self):
        self.assertEqual(self.entity.get_form(''), self.nominal)
        self.assertEqual(self.entity.get_form(self.form1), self.text1)
        self.assertEqual(self.entity.get_form('invalid tags'), '!Неизвестная граммема: invalid tags!')
        self.assertEqual(self.entity.get_form('plur'), 'люди')

    def test_set_nominal(self):
        new_nomial = 'TEST'
        self.assertEqual(self.entity.get_form('plur'), 'люди')
        self.entity.set_nominal(new_nomial)
        self.assertEqual(self.entity.get_nominal(), new_nomial)
        self.assertEqual(self.entity.get_form('plur'), new_nomial)
        self.assertEqual(self.entity.manual, [])
