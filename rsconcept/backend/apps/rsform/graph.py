''' Utility: Graph implementation. '''
from typing import Dict, Iterable, Optional, cast


class Graph:
    ''' Directed graph. '''
    def __init__(self, graph: Optional[Dict[str, list[str]]]=None):
        if graph is None:
            self._graph = cast(Dict[str, list[str]], dict())
        else:
            self._graph = graph

    def contains(self, node_id: str) -> bool:
        ''' Check if node is in graph. '''
        return node_id in self._graph
    
    def has_edge(self, id_from: str, id_to: str) -> bool:
        ''' Check if edge is in graph. '''
        return self.contains(id_from) and id_to in self._graph[id_from]

    def add_node(self, node_id: str):
        ''' Add node to graph. '''
        if not self.contains(node_id):
            self._graph[node_id] = []

    def add_edge(self, id_from: str, id_to: str):
        ''' Add edge to graph. '''
        self.add_node(id_from)
        self.add_node(id_to)
        if id_to not in self._graph[id_from]:
            self._graph[id_from].append(id_to)

    def expand_outputs(self, origin: Iterable[str]) -> list[str]:
        ''' Expand origin nodes forward through graph edges. '''
        result: list[str] = []
        marked: set[str] = set(origin)
        for node_id in origin:
            if self.contains(node_id):
                for child_id in self._graph[node_id]:
                    if child_id not in marked and child_id not in result:
                        result.append(child_id)
        position: int = 0
        while position < len(result):
            node_id = result[position]
            position += 1
            if (node_id not in marked):
                marked.add(node_id)
                for child_id in self._graph[node_id]:
                    if child_id not in marked and child_id not in result:
                        result.append(child_id)
        return result

    def topological_order(self) -> list[str]:
        ''' Return nodes in topological order. '''
        result: list[str] = []
        marked: set[str] = set()
        for node_id in self._graph.keys():
            if node_id not in marked:
                to_visit: list[str] = [node_id]
                while len(to_visit) > 0:
                    node = to_visit[-1]
                    if node in marked:
                        if node not in result:
                            result.append(node)
                        to_visit.remove(node)
                    else:
                        marked.add(node)
                        if len(self._graph[node]) > 0:
                            for child_id in self._graph[node]:
                                if child_id not in marked:
                                    to_visit.append(child_id)
        result.reverse()
        return result
