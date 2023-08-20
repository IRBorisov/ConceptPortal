''' Unit tests: reference. '''
import unittest

from cctext import EntityReference, ReferenceType, SyntacticReference, parse_reference

class TestReferences(unittest.TestCase):
    ''' Test class for references. '''

    def test_EntityReference(self):
        ''' Testing EntityRefence basics. '''
        ref = EntityReference('X1', 'sing,nomn')
        self.assertEqual(ref.get_type(), ReferenceType.entity)
        self.assertEqual(ref.to_text(), '@{X1|sing,nomn}')

    def test_SyntacticReference(self):
        ''' Testing SyntacticReference basics. '''
        ref = SyntacticReference(-1, 'черный')
        self.assertEqual(ref.get_type(), ReferenceType.syntactic)
        self.assertEqual(ref.to_text(), '@{-1|черный}')

    def test_parse_reference_invalid(self):
        ''' Testing parsing reference invalid input. '''
        self.assertIsNone(parse_reference(''))
        self.assertIsNone(parse_reference('X1'))
        self.assertIsNone(parse_reference('invalid'))
        self.assertIsNone(parse_reference(' '))
        self.assertIsNone(parse_reference('@{|}'))
        self.assertIsNone(parse_reference('@{|черный}'))
        self.assertIsNone(parse_reference('@{ | }'))
        self.assertIsNone(parse_reference('@{-1| }'))
        self.assertIsNone(parse_reference('@{1| }'))
        self.assertIsNone(parse_reference('@{0|черный}'))

    def test_parse_reference(self):
        ''' Testing parsing reference text. '''
        ref = parse_reference('@{1| черный }')
        self.assertIsNotNone(ref)
        self.assertEqual(ref.to_text(), '@{1|черный}')        
        self.assertEqual(ref.get_type(), ReferenceType.syntactic)

        ref = parse_reference('@{X1 | VERB, past, sing}')
        self.assertIsNotNone(ref)
        self.assertEqual(ref.to_text(), '@{X1|VERB,past,sing}')        
        self.assertEqual(ref.get_type(), ReferenceType.entity)
