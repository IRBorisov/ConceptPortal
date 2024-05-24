''' Unit tests: graph. '''
import unittest

from apps.rsform.graph import Graph


class TestGraph(unittest.TestCase):
    ''' Test class for graph. '''

    def test_construction(self):
        graph = Graph()
        self.assertFalse(graph.contains(1))

        graph.add_node(1)
        self.assertTrue(graph.contains(1))

        graph.add_edge(2, 3)
        self.assertTrue(graph.contains(2))
        self.assertTrue(graph.contains(3))
        self.assertTrue(graph.has_edge(2, 3))
        self.assertFalse(graph.has_edge(3, 2))

        graph = Graph({1: [3, 4], 2: [1], 3: [], 4: [], 5: []})
        self.assertTrue(graph.contains(1))
        self.assertTrue(graph.contains(5))
        self.assertTrue(graph.has_edge(1, 3))
        self.assertTrue(graph.has_edge(2, 1))


    def test_expand_outputs(self):
        graph = Graph({
            1: [2],
            2: [3, 5],
            3: [],
            5: [6],
            6: [1],
            7: []
        })
        self.assertEqual(graph.expand_outputs([]), [])
        self.assertEqual(graph.expand_outputs([3]), [])
        self.assertEqual(graph.expand_outputs([7]), [])
        self.assertEqual(graph.expand_outputs([2, 5]), [3, 6, 1])

    def test_expand_inputs(self):
        graph = Graph({
            1: [2],
            2: [3, 5],
            3: [],
            5: [6],
            6: [1],
            7: []
        })
        self.assertEqual(graph.expand_inputs([]), [])
        self.assertEqual(graph.expand_inputs([1]), [6, 5, 2])
        self.assertEqual(graph.expand_inputs([7]), [])
        self.assertEqual(graph.expand_inputs([3]), [2, 1, 6, 5])
        self.assertEqual(graph.expand_inputs([2, 5]), [1, 6])


    def test_transitive_closure(self):
        graph = Graph({
            1: [2],
            2: [3, 5],
            3: [],
            5: [6],
            6: [],
            7: [6]
        })
        self.assertEqual(graph.transitive_closure(), {
            1: [2, 3, 5, 6],
            2: [3, 5, 6],
            3: [],
            5: [6],
            6: [],
            7: [6]
        })

    def test_topological_order(self):
        self.assertEqual(Graph().topological_order(), [])
        graph = Graph({
            1: [],
            2: [1],
            3: [],
            4: [3],
            5: [6],
            6: [1, 2]
        })
        self.assertEqual(graph.topological_order(), [5, 6, 4, 3, 2, 1])

        graph = Graph({
            1: [1],
            2: [4],
            3: [2],
            4: [],
            5: [2],
        })
        self.assertEqual(graph.topological_order(), [5, 3, 2, 4, 1])

    def test_sort_stable(self):
        graph = Graph({
            1: [2],
            2: [3, 5],
            3: [],
            5: [6],
            6: [],
            7: [6]
        })
        self.assertEqual(graph.sort_stable([]), [])
        self.assertEqual(graph.sort_stable([1]), [1])
        self.assertEqual(graph.sort_stable([1, 2]), [1, 2])
        self.assertEqual(graph.sort_stable([7, 2, 1]), [7, 1, 2])
        self.assertEqual(graph.sort_stable([2, 1, 7]), [1, 2, 7])
        self.assertEqual(graph.sort_stable([1, 2, 7]), [1, 2, 7])
        self.assertEqual(graph.sort_stable([2, 1, 3, 6, 7]), [1, 2, 3, 7, 6])
        self.assertEqual(graph.sort_stable([2, 1, 6, 7, 3]), [1, 2, 7, 6, 3])
