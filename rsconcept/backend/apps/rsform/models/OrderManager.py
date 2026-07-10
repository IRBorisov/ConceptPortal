''' Models: RSForm order manager. '''

from collections import deque

from .Constituenta import Constituenta, CstType
from .RSFormCached import RSFormCached
from .SemanticInfo import SemanticInfo


class OrderManager:
    ''' Ordering helper class.

    Restore order is one topological pass (Kahn) over the formal dependency
    graph. Tie-breaking uses a preferred baseline (type/kernel priority);
    when a node is placed, newly unlocked semantic children are emitted next.
    Formal edges always win over clustering.
    '''

    def __init__(self, schema: RSFormCached) -> None:
        self._semantic = SemanticInfo(schema)
        self._items = schema.cache.constituents
        self._cst_by_ID = schema.cache.by_id

    def restore_order(self) -> None:
        ''' Restore constituent order with one stable topological pass. '''
        if len(self._items) <= 1:
            return
        self._items = self._sort_topological_stable()
        self._override_order()

    def _sort_topological_stable(self) -> list[Constituenta]:
        ''' Kahn sort: formal deps hard, semantic children sticky, else stable. '''
        preferred = self._kernel_priority()
        rank = {cst.pk: index for index, cst in enumerate(preferred)}
        graph = self._semantic.graph

        remaining_inputs = {
            cst.pk: sum(1 for src in graph.inputs[cst.pk] if src in rank)
            for cst in preferred
        }
        ready = {cst.pk for cst in preferred if remaining_inputs[cst.pk] == 0}
        children = {
            cst.pk: [child for child in self._semantic[cst.pk]['children'] if child in rank]
            for cst in preferred
        }

        result: list[Constituenta] = []
        pending_children: deque[int] = deque()
        pending_queued: set[int] = set()

        def enqueue_sticky(candidate_ids: list[int]) -> None:
            sticky = [
                child_id for child_id in candidate_ids
                if child_id in ready and child_id not in pending_queued
            ]
            sticky.sort(key=lambda child_id: rank[child_id])
            for child_id in sticky:
                pending_children.append(child_id)
                pending_queued.add(child_id)

        def pick_ready() -> int:
            while pending_children:
                child_id = pending_children.popleft()
                pending_queued.discard(child_id)
                if child_id in ready:
                    return child_id
            return min(ready, key=lambda node_id: rank[node_id])

        while ready or pending_children:
            if not ready and pending_children:
                pending_children.clear()
                pending_queued.clear()
                continue
            node_id = pick_ready()
            ready.remove(node_id)
            result.append(self._cst_by_ID[node_id])

            for dependent_id in graph.outputs[node_id]:
                if dependent_id not in remaining_inputs:
                    continue
                remaining_inputs[dependent_id] -= 1
                if remaining_inputs[dependent_id] == 0:
                    ready.add(dependent_id)

            # Semantic children that are now ready follow this node immediately.
            enqueue_sticky(children[node_id])

        # Cyclic leftovers keep preferred relative order after the DAG prefix.
        if len(result) < len(preferred):
            placed = {cst.pk for cst in result}
            result.extend(cst for cst in preferred if cst.pk not in placed)
        return result

    def _kernel_priority(self) -> list[Constituenta]:
        ''' Type/kernel priority used as the stable baseline. '''
        result = [cst for cst in self._items if cst.cst_type == CstType.BASE]
        result = result + [cst for cst in self._items if cst.cst_type == CstType.CONSTANT]
        result = result + \
            [cst for cst in self._items if result.count(cst) == 0 and len(self._semantic.graph.inputs[cst.pk]) == 0]
        kernel = [
            cst.pk for cst in self._items if
            cst.cst_type in [CstType.STRUCTURED, CstType.AXIOM] or
            self._cst_by_ID[self._semantic.parent(cst.pk)].cst_type == CstType.STRUCTURED
        ]
        kernel = kernel + self._semantic.graph.expand_inputs(kernel)
        result = result + [cst for cst in self._items if result.count(cst) == 0 and cst.pk in kernel]
        result = result + [cst for cst in self._items if result.count(cst) == 0]
        return result

    def _override_order(self) -> None:
        order = 0
        for cst in self._items:
            cst.order = order
            order += 1
        Constituenta.objects.bulk_update(self._items, ['order'])
