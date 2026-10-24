''' Default node positions for OSS edits made through the agent API.

The UI computes positions in the browser (``LayoutManager`` in
``@rsconcept/domain/library/oss-layout-api``). Agents send no layout, so the
server applies the same rules. Coordinates are absolute, as in the stored layout.
'''
from __future__ import annotations

import math
from typing import Any

from apps.library.models import LibraryItem
from apps.oss.models import Argument, Block, Layout, Operation, OperationType

GRID_SIZE = 10
MIN_DISTANCE = 2 * GRID_SIZE
OPERATION_NODE_WIDTH = 150
OPERATION_NODE_HEIGHT = 40
BLOCK_NODE_MIN_WIDTH = 160
BLOCK_NODE_MIN_HEIGHT = 100


def operation_node_id(pk: int) -> str:
    ''' Layout id of an operation node. '''
    return f'o{pk}'


def block_node_id(pk: int) -> str:
    ''' Layout id of a block node. '''
    return f'b{pk}'


def default_operation_rect() -> dict:
    ''' Size of a new operation node at the origin. '''
    return {'x': 0, 'y': 0, 'width': OPERATION_NODE_WIDTH, 'height': OPERATION_NODE_HEIGHT}


def default_block_rect() -> dict:
    ''' Size of a new block node at the origin. '''
    return {'x': 0, 'y': 0, 'width': BLOCK_NODE_MIN_WIDTH, 'height': BLOCK_NODE_MIN_HEIGHT}


def current_layout(item: LibraryItem) -> list[dict]:
    ''' Stored layout of the OSS, as a list the caller may change. '''
    return [dict(node) for node in Layout.objects.get(oss=item).data]


class OssLayoutPlanner:
    ''' Positions for new or moved nodes. Changes ``layout`` in place. '''

    def __init__(self, item: LibraryItem, layout: list[dict]):
        self.layout = layout
        self._block_parent: dict[int, int | None] = dict(
            Block.objects.filter(oss=item).values_list('pk', 'parent_id')
        )
        self._operations: list[dict[str, Any]] = [
            dict(row) for row in Operation.objects.filter(oss=item).values('pk', 'parent_id', 'operation_type')
        ]
        self._with_arguments = set(
            Argument.objects.filter(operation__oss=item).values_list('operation_id', flat=True)
        )

    def new_operation_position(
        self,
        position: dict,
        parent: int | None,
        arguments: list[int] | None = None,
    ) -> dict:
        ''' Position of a new operation; mirrors ``newOperationPosition``. '''
        result = dict(position)
        args = arguments or []
        parent_node = self._find(block_node_id(parent)) if parent is not None else None
        operations = [node for node in self.layout if node['nodeID'].startswith('o')]
        arg_ids = {operation_node_id(pk) for pk in args}
        arg_nodes = [node for node in operations if node['nodeID'] in arg_ids]
        has_arguments = len(arg_nodes) > 0
        if has_arguments:
            result.update(_position_from_arguments(arg_nodes))
        elif parent_node is not None:
            result['x'] = parent_node['x'] + MIN_DISTANCE
            result['y'] = parent_node['y'] + MIN_DISTANCE
        else:
            result.update(self._free_operation_position(result))

        sibling_blocks = {block_node_id(pk) for pk, owner in self._block_parent.items() if owner == parent}
        _prevent_overlap(
            result,
            [node for node in self.layout if node['nodeID'] in sibling_blocks],
            move_x=not has_arguments,
            move_y=has_arguments,
        )
        _prevent_overlap(result, operations)
        _extend_parent_bounds(parent_node, result)
        return result

    def new_block_position(
        self,
        position: dict,
        parent: int | None,
        blocks: list[int],
        operations: list[int],
    ) -> dict:
        ''' Position of a new block; mirrors ``newBlockPosition``. '''
        child_ids = {block_node_id(pk) for pk in blocks} | {operation_node_id(pk) for pk in operations}
        children = [node for node in self.layout if node['nodeID'] in child_ids]
        parent_node = self._find(block_node_id(parent)) if parent is not None else None
        parent_id = parent if parent_node is not None else None

        if children:
            result = _position_from_children(children)
        elif parent_node is not None:
            result = {
                'x': parent_node['x'] + MIN_DISTANCE,
                'y': parent_node['y'] + MIN_DISTANCE,
                'width': position['width'],
                'height': position['height'],
            }
        else:
            result = self._free_block_position(dict(position))

        if not children:
            siblings = {block_node_id(pk) for pk, owner in self._block_parent.items() if owner == parent_id}
            _prevent_overlap(result, [node for node in self.layout if node['nodeID'] in siblings])

        _extend_parent_bounds(parent_node, result)
        return result

    def new_clone_position(self, source: int, parent: int | None) -> dict:
        ''' Position of a copy or replica next to its source; mirrors ``newClonePosition``. '''
        source_node = self._find(operation_node_id(source))
        if source_node is None:
            return self.new_operation_position(default_operation_rect(), parent)
        return {
            'x': source_node['x'] + source_node['width'] / 2 + GRID_SIZE,
            'y': source_node['y'] + source_node['height'] / 2 + GRID_SIZE,
            'width': OPERATION_NODE_WIDTH,
            'height': OPERATION_NODE_HEIGHT,
        }

    def change_parent(self, node_id: str, new_parent: int | None) -> None:
        ''' Move a node and its descendants into a new parent; mirrors ``onChangeParent``. '''
        target = self._find(node_id)
        if target is None:
            return
        parent_node = self._find(block_node_id(new_parent)) if new_parent is not None else None
        descendants = self._descendants(node_id)
        moved = {node_id} | descendants
        new_position = dict(target)
        if parent_node is None:
            roots = self._root_nodes() - moved
            _prevent_overlap(new_position, [node for node in self.layout if node['nodeID'] in roots])
        elif not _strict_overlap(target, parent_node):
            new_position['x'] = parent_node['x'] + MIN_DISTANCE
            new_position['y'] = parent_node['y'] + MIN_DISTANCE
            siblings = self._children(int(parent_node['nodeID'][1:])) - moved
            _prevent_overlap(new_position, [node for node in self.layout if node['nodeID'] in siblings])

        dx = new_position['x'] - target['x']
        dy = new_position['y'] - target['y']
        if dx != 0 or dy != 0:
            for node in self.layout:
                if node['nodeID'] in moved:
                    node['x'] += dx
                    node['y'] += dy
        _extend_parent_bounds(parent_node, target)
        self._set_parent(node_id, new_parent)

    # ====== Internals ============
    def _find(self, node_id: str) -> dict | None:
        return next((node for node in self.layout if node['nodeID'] == node_id), None)

    def _parent_of(self, node_id: str) -> int | None:
        pk = int(node_id[1:])
        if node_id.startswith('b'):
            return self._block_parent.get(pk)
        operation = next((op for op in self._operations if op['pk'] == pk), None)
        return operation['parent_id'] if operation is not None else None

    def _set_parent(self, node_id: str, parent: int | None) -> None:
        pk = int(node_id[1:])
        if node_id.startswith('b'):
            self._block_parent[pk] = parent
            return
        for operation in self._operations:
            if operation['pk'] == pk:
                operation['parent_id'] = parent

    def _children(self, block: int) -> set[str]:
        result = {block_node_id(pk) for pk, owner in self._block_parent.items() if owner == block}
        result |= {operation_node_id(op['pk']) for op in self._operations if op['parent_id'] == block}
        return result

    def _descendants(self, node_id: str) -> set[str]:
        if not node_id.startswith('b'):
            return set()
        result: set[str] = set()
        queue = [int(node_id[1:])]
        while queue:
            current = queue.pop()
            for child in self._children(current):
                if child in result:
                    continue
                result.add(child)
                if child.startswith('b'):
                    queue.append(int(child[1:]))
        return result

    def _root_nodes(self) -> set[str]:
        return {node['nodeID'] for node in self.layout if self._parent_of(node['nodeID']) is None}

    def _free_operation_position(self, initial: dict) -> dict:
        if not self._operations:
            return {'x': initial['x'], 'y': initial['y']}
        free_inputs = {
            operation_node_id(op['pk'])
            for op in self._operations
            if op['parent_id'] is None and (
                op['operation_type'] != OperationType.SYNTHESIS or op['pk'] not in self._with_arguments
            )
        }
        nodes = [node for node in self.layout if node['nodeID'] in free_inputs]
        if not nodes:
            nodes = [node for node in self.layout if node['nodeID'].startswith('o')]
        if not nodes:
            return {'x': initial['x'], 'y': initial['y']}
        return {
            'x': max(node['x'] for node in nodes) + OPERATION_NODE_WIDTH + MIN_DISTANCE + GRID_SIZE,
            'y': min(node['y'] for node in nodes),
        }

    def _free_block_position(self, initial: dict) -> dict:
        roots = {block_node_id(pk) for pk, owner in self._block_parent.items() if owner is None}
        nodes = [node for node in self.layout if node['nodeID'] in roots]
        if not nodes:
            return initial
        return {
            **initial,
            'x': max(node['x'] + node['width'] for node in nodes) + MIN_DISTANCE,
            'y': min(node['y'] for node in nodes),
        }


def _overlap(a: dict, b: dict) -> bool:
    return not (
        a['x'] + a['width'] + MIN_DISTANCE <= b['x']
        or b['x'] + b['width'] + MIN_DISTANCE <= a['x']
        or a['y'] + a['height'] + MIN_DISTANCE <= b['y']
        or b['y'] + b['height'] + MIN_DISTANCE <= a['y']
    )


def _strict_overlap(a: dict, b: dict) -> bool:
    return not (
        a['x'] + a['width'] <= b['x']
        or b['x'] + b['width'] <= a['x']
        or a['y'] + a['height'] <= b['y']
        or b['y'] + b['height'] <= a['y']
    )


def _prevent_overlap(target: dict, fixed: list[dict], move_x: bool = True, move_y: bool = True) -> None:
    if not (move_x or move_y) or not fixed:
        return
    while any(_overlap(target, node) for node in fixed):
        if move_x:
            target['x'] += MIN_DISTANCE
        if move_y:
            target['y'] += MIN_DISTANCE


def _extend_parent_bounds(parent: dict | None, child: dict) -> None:
    if parent is None:
        return
    parent['width'] = max(parent['width'], child['x'] + child['width'] + MIN_DISTANCE - parent['x'])
    parent['height'] = max(parent['height'], child['y'] + child['height'] + MIN_DISTANCE - parent['y'])


def _position_from_arguments(nodes: list[dict]) -> dict:
    min_x = min(node['x'] for node in nodes)
    max_x = max(node['x'] for node in nodes)
    max_y = max(node['y'] for node in nodes)
    return {
        'x': math.ceil((max_x + min_x) / 2 / GRID_SIZE) * GRID_SIZE,
        'y': max_y + 2 * OPERATION_NODE_HEIGHT + MIN_DISTANCE,
    }


def _position_from_children(nodes: list[dict]) -> dict:
    left = min(node['x'] for node in nodes) - MIN_DISTANCE
    top = min(node['y'] for node in nodes) - MIN_DISTANCE
    right = max(node['x'] + node['width'] for node in nodes) + MIN_DISTANCE
    bottom = max(node['y'] + node['height'] for node in nodes) + MIN_DISTANCE
    return {'x': left, 'y': top, 'width': right - left, 'height': bottom - top}
