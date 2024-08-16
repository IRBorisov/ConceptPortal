''' Utility: Graph implementation. '''
import copy
from typing import Generic, Iterable, Optional, TypeVar

ItemType = TypeVar("ItemType")


class Graph(Generic[ItemType]):
    ''' Directed graph. '''

    def __init__(self, graph: Optional[dict[ItemType, list[ItemType]]] = None):
        if graph is None:
            self.outputs: dict[ItemType, list[ItemType]] = {}
            self.inputs: dict[ItemType, list[ItemType]] = {}
        else:
            self.outputs = graph
            self.inputs: dict[ItemType, list[ItemType]] = {id: [] for id in graph.keys()}  # type: ignore[no-redef]
            for parent in graph.keys():
                for child in graph[parent]:
                    self.inputs[child].append(parent)

    def contains(self, node_id: ItemType) -> bool:
        ''' Check if node is in graph. '''
        return node_id in self.outputs

    def has_edge(self, src: ItemType, dest: ItemType) -> bool:
        ''' Check if edge is in graph. '''
        return self.contains(src) and dest in self.outputs[src]

    def add_node(self, node_id: ItemType):
        ''' Add node to graph. '''
        if not self.contains(node_id):
            self.outputs[node_id] = []
            self.inputs[node_id] = []

    def add_edge(self, src: ItemType, dest: ItemType):
        ''' Add edge to graph. '''
        self.add_node(src)
        self.add_node(dest)
        if dest not in self.outputs[src]:
            self.outputs[src].append(dest)
        if src not in self.inputs[dest]:
            self.inputs[dest].append(src)

    def remove_edge(self, src: ItemType, dest: ItemType):
        ''' Remove edge from graph. '''
        if not self.contains(src) or not self.contains(dest):
            return
        if dest in self.outputs[src]:
            self.outputs[src].remove(dest)
        if src in self.inputs[dest]:
            self.inputs[dest].remove(src)

    def remove_node(self, target: ItemType):
        ''' Remove node from graph. '''
        if not self.contains(target):
            return
        del self.outputs[target]
        del self.inputs[target]
        for list_out in self.outputs.values():
            if target in list_out:
                list_out.remove(target)
        for list_in in self.inputs.values():
            if target in list_in:
                list_in.remove(target)

    def expand_inputs(self, origin: Iterable[ItemType]) -> list[ItemType]:
        ''' Expand origin nodes forward through graph edges. '''
        result: list[ItemType] = []
        marked: set[ItemType] = set(origin)
        for node_id in origin:
            if self.contains(node_id):
                for child_id in self.inputs[node_id]:
                    if child_id not in marked and child_id not in result:
                        result.append(child_id)
        position: int = 0
        while position < len(result):
            node_id = result[position]
            position += 1
            if node_id not in marked:
                marked.add(node_id)
                for child_id in self.inputs[node_id]:
                    if child_id not in marked and child_id not in result:
                        result.append(child_id)
        return result

    def expand_outputs(self, origin: Iterable[ItemType]) -> list[ItemType]:
        ''' Expand origin nodes forward through graph edges. '''
        result: list[ItemType] = []
        marked: set[ItemType] = set(origin)
        for node_id in origin:
            if self.contains(node_id):
                for child_id in self.outputs[node_id]:
                    if child_id not in marked and child_id not in result:
                        result.append(child_id)
        position: int = 0
        while position < len(result):
            node_id = result[position]
            position += 1
            if node_id not in marked:
                marked.add(node_id)
                for child_id in self.outputs[node_id]:
                    if child_id not in marked and child_id not in result:
                        result.append(child_id)
        return result

    def transitive_closure(self) -> dict[ItemType, list[ItemType]]:
        ''' Generate transitive closure - list of reachable nodes for each node. '''
        result = copy.deepcopy(self.outputs)
        order = self.topological_order()
        order.reverse()
        for node_id in order:
            if len(self.inputs[node_id]) == 0:
                continue
            for parent in self.inputs[node_id]:
                result[parent] = result[parent] + [id for id in result[node_id] if id not in result[parent]]
        return result

    def topological_order(self) -> list[ItemType]:
        ''' Return nodes in SOME topological order. '''
        result: list[ItemType] = []
        marked: set[ItemType] = set()
        for node_id in self.outputs.keys():
            if node_id in marked:
                continue
            to_visit: list[ItemType] = [node_id]
            while len(to_visit) > 0:
                node = to_visit[-1]
                if node in marked:
                    if node not in result:
                        result.append(node)
                    to_visit.remove(node)
                else:
                    marked.add(node)
                    if len(self.outputs[node]) <= 0:
                        continue
                    for child_id in self.outputs[node]:
                        if child_id not in marked:
                            to_visit.append(child_id)
        result.reverse()
        return result

    def sort_stable(self, target: list[ItemType]) -> list[ItemType]:
        ''' Returns target stable sorted in topological order based on minimal modifications. '''
        if len(target) <= 1:
            return target
        reachable = self.transitive_closure()
        test_set: set[ItemType] = set()
        result: list[ItemType] = []
        for node_id in reversed(target):
            need_move = node_id in test_set
            test_set = test_set.union(reachable[node_id])
            if not need_move:
                result.append(node_id)
                continue
            for (index, parent) in enumerate(result):
                if node_id in reachable[parent]:
                    if parent in reachable[node_id]:
                        result.append(node_id)
                    else:
                        result.insert(index, node_id)
                    break
        result.reverse()
        return result
