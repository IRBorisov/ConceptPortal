''' Unit tests: resolver. '''
import unittest
from typing import cast

from cctext import (
    EntityReference, TermContext, Entity, SyntacticReference,
    Resolver, ResolvedReference, Position, TermForm,
    resolve_entity, resolve_syntactic, extract_entities
)


class TestUtils(unittest.TestCase):
    ''' Test utilitiy methods. '''
    def test_extract_entities(self):
        self.assertEqual(extract_entities(''), [])
        self.assertEqual(extract_entities('@{-1|черны}'), [])
        self.assertEqual(extract_entities('@{X1|nomn}'), ['X1'])
        self.assertEqual(extract_entities('@{X1|datv}'), ['X1'])
        self.assertEqual(extract_entities('@{X1|datv} @{X1|datv} @{X2|datv}'), ['X1', 'X2'])
        self.assertEqual(extract_entities('@{X1} | @{X1} | @{X2}'), [])


class TestResolver(unittest.TestCase):
    '''Test reference Resolver.'''
    def setUp(self):
        self.context = cast(TermContext, {})
        self.context['X1'] = Entity('X1', 'человек')
        self.context['X2'] = Entity('X2', '')
        self.resolver = Resolver(self.context)

    def test_resolve_entity(self):
        self.assertEqual(resolve_entity(EntityReference('X1', ''), self.context), 'человек')
        self.assertEqual(resolve_entity(EntityReference('X1', 'plur'), self.context), 'люди')
        self.assertEqual(resolve_entity(EntityReference('X2', ''), self.context), '!Отсутствует термин: X2!')
        self.assertEqual(resolve_entity(EntityReference('X1', 'invalid'), self.context), '!Неизвестная граммема: invalid!')
        self.assertEqual(resolve_entity(EntityReference('X123', 'plur'), self.context), '!Неизвестная сущность: X123!')

    def test_resolve_syntactic(self):
        ref = ResolvedReference(ref=EntityReference('X1', 'sing,datv'), resolved='человеку')
        allrefs = [ref, ref, ref, ref]
        self.assertEqual(resolve_syntactic(SyntacticReference(text='умный', referral_offset=-1), 0, allrefs), '!Некорректное смещение: -1!')
        self.assertEqual(resolve_syntactic(SyntacticReference(text='умный', referral_offset=1), 3, allrefs), '!Некорректное смещение: 1!')
        self.assertEqual(resolve_syntactic(SyntacticReference(text='умный', referral_offset=1), 0, allrefs), 'умному')
        self.assertEqual(resolve_syntactic(SyntacticReference(text='умный', referral_offset=2), 0, allrefs), 'умному')
        self.assertEqual(resolve_syntactic(SyntacticReference(text='умный', referral_offset=3), 0, allrefs), 'умному')
        self.assertEqual(resolve_syntactic(SyntacticReference(text='умный', referral_offset=-1), 3, allrefs), 'умному')
        self.assertEqual(resolve_syntactic(SyntacticReference(text='умный', referral_offset=-2), 3, allrefs), 'умному')
        self.assertEqual(resolve_syntactic(SyntacticReference(text='умный', referral_offset=-3), 3, allrefs), 'умному')

    def test_resolve_invalid(self):
        self.assertEqual(self.resolver.resolve(''), '')
        self.assertEqual(len(self.resolver.refs), 0)

        self.assertEqual(self.resolver.resolve('simple text'), 'simple text')
        self.assertEqual(len(self.resolver.refs), 0)

        self.assertEqual(self.resolver.resolve('simple @{unparsable ref} text'), 'simple @{unparsable ref} text')
        self.assertEqual(len(self.resolver.refs), 0)

    def test_resolve_single(self):
        self.assertEqual(self.resolver.resolve('просто @{-1|умный} текст'), 'просто !Некорректное смещение: -1! текст')
        self.assertEqual(len(self.resolver.refs), 1)
        self.assertEqual(self.resolver.refs[0].pos_input, Position(7, 18))
        self.assertEqual(self.resolver.refs[0].pos_output, Position(7, 34))

        self.assertEqual(self.resolver.resolve('просто @{X123|sing,nomn} текст'), 'просто !Неизвестная сущность: X123! текст')
        self.assertEqual(len(self.resolver.refs), 1)
        self.assertEqual(self.resolver.refs[0].pos_input, Position(7, 24))
        self.assertEqual(self.resolver.refs[0].pos_output, Position(7, 35))

        self.assertEqual(self.resolver.resolve('@{X1|sing,nomn}'), 'человек')
        self.assertEqual(len(self.resolver.refs), 1)
        self.assertEqual(self.resolver.refs[0].pos_input, Position(0, 15))
        self.assertEqual(self.resolver.refs[0].pos_output, Position(0, 7))

        self.assertEqual(self.resolver.resolve('просто @{X1|sing,nomn} текст'), 'просто человек текст')
        self.assertEqual(len(self.resolver.refs), 1)
        self.assertEqual(self.resolver.refs[0].pos_input, Position(7, 22))
        self.assertEqual(self.resolver.refs[0].pos_output, Position(7, 14))

    def test_resolve_multiple(self):
        input =  '@{X1|sing,datv} @{-1|умный} @{X1|plur} завидуют'
        self.assertEqual(self.resolver.resolve(input), 'человеку умному люди завидуют')
        self.assertEqual(len(self.resolver.refs), 3)
        self.assertEqual(self.resolver.refs[0].pos_input, Position(0, 15))
        self.assertEqual(self.resolver.refs[0].pos_output, Position(0, 8))
        self.assertEqual(self.resolver.refs[1].pos_input, Position(16, 27))
        self.assertEqual(self.resolver.refs[1].pos_output, Position(9, 15))
        self.assertEqual(self.resolver.refs[2].pos_input, Position(28, 38))
        self.assertEqual(self.resolver.refs[2].pos_output, Position(16, 20))

    def test_resolve_manual_forms(self):
        self.context['X1'] = Entity(
            alias='X1',
            nominal='человек',
            manual_forms=[
                TermForm(text='тест1', grams='NOUN,sing'.split(',')),
                TermForm(text='тест2', grams='NOUN,datv,plur'.split(','))
            ]
        )
        self.assertEqual(self.resolver.resolve('@{X1|NOUN,sing,nomn}'), 'тест1', 'Match subset')
        self.assertEqual(self.resolver.resolve('@{X1|NOUN,sing}'), 'тест1', 'Match full')
        self.assertEqual(self.resolver.resolve('@{X1|NOUN,datv,plur}'), 'тест2')
        self.assertEqual(self.resolver.resolve('@{X1|NOUN,plur,datv}'), 'тест2', 'Match any order')
        self.assertEqual(self.resolver.resolve('@{X1|datv,plur}'), 'тест2', 'Match missing POS')
        self.assertEqual(self.resolver.resolve('@{X1|NOUN,datv,sing}'), 'тест1')
        self.assertEqual(self.resolver.resolve('@{X1|VERB,datv,plur}'), 'человек')
