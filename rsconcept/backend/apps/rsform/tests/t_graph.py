''' Unit tests: graph. '''
import unittest

from apps.rsform.graph import Graph


class TestGraph(unittest.TestCase):
    ''' Test class for graph. '''
    def test_construction(self):
        ''' Test graph construction methods. '''
        graph = Graph()
        self.assertFalse(graph.contains('X1'))

        graph.add_node('X1')
        self.assertTrue(graph.contains('X1'))

        graph.add_edge('X2', 'X3')
        self.assertTrue(graph.contains('X2'))
        self.assertTrue(graph.contains('X3'))
        self.assertTrue(graph.has_edge('X2', 'X3'))
        self.assertFalse(graph.has_edge('X3', 'X2'))

        graph = Graph({'X1': ['X3', 'X4'], 'X2': ['X1'], 'X3': [], 'X4': [], 'X5': []})
        self.assertTrue(graph.contains('X1'))
        self.assertTrue(graph.contains('X5'))
        self.assertTrue(graph.has_edge('X1', 'X3'))
        self.assertTrue(graph.has_edge('X2', 'X1'))

    def test_expand_outputs(self):
        ''' Test Method: Graph.expand_outputs. '''
        graph = Graph({
            'X1': ['X2'],
            'X2': ['X3', 'X5'],
            'X3': [],
            'X5': ['X6'],
            'X6': ['X1'],
            'X7': []
        })
        self.assertEqual(graph.expand_outputs([]), [])
        self.assertEqual(graph.expand_outputs(['X3']), [])
        self.assertEqual(graph.expand_outputs(['X7']), [])
        self.assertEqual(graph.expand_outputs(['X2', 'X5']), ['X3', 'X6', 'X1'])

    def test_topological_order(self):
        ''' Test Method: Graph.topological_order. '''
        self.assertEqual(Graph().topological_order(), [])
        graph = Graph({
            'X1': [],
            'X2': ['X1'],
            'X3': [],
            'X4': ['X3'],
            'X5': ['X6'],
            'X6': ['X1', 'X2']
        })
        self.assertEqual(graph.topological_order(), ['X5', 'X6', 'X4', 'X3', 'X2', 'X1'])

        graph = Graph({
            'X1': ['X1'],
            'X2': ['X4'],
            'X3': ['X2'],
            'X4': [],
            'X5': ['X2'],
        })
        self.assertEqual(graph.topological_order(), ['X5', 'X3', 'X2', 'X4', 'X1'])
