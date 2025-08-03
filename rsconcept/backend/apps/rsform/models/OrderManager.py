''' Models: RSForm order manager. '''

from .Constituenta import Constituenta, CstType
from .RSFormCached import RSFormCached
from .SemanticInfo import SemanticInfo


class OrderManager:
    ''' Ordering helper class '''

    def __init__(self, schema: RSFormCached):
        self._semantic = SemanticInfo(schema)
        self._items = schema.cache.constituents
        self._cst_by_ID = schema.cache.by_id

    def restore_order(self) -> None:
        ''' Implement order restoration process. '''
        if len(self._items) <= 1:
            return
        self._fix_kernel()
        self._fix_topological()
        self._fix_semantic_children()
        self._override_order()

    def _fix_topological(self) -> None:
        sorted_ids = self._semantic.graph.sort_stable([cst.pk for cst in self._items])
        sorted_items = [next(cst for cst in self._items if cst.pk == id) for id in sorted_ids]
        self._items = sorted_items

    def _fix_kernel(self) -> None:
        result = [cst for cst in self._items if cst.cst_type == CstType.BASE]
        result = result + [cst for cst in self._items if cst.cst_type == CstType.CONSTANT]
        kernel = [
            cst.pk for cst in self._items if
            cst.cst_type in [CstType.STRUCTURED, CstType.AXIOM] or
            self._cst_by_ID[self._semantic.parent(cst.pk)].cst_type == CstType.STRUCTURED
        ]
        kernel = kernel + self._semantic.graph.expand_inputs(kernel)
        result = result + [cst for cst in self._items if result.count(cst) == 0 and cst.pk in kernel]
        result = result + [cst for cst in self._items if result.count(cst) == 0]
        self._items = result

    def _fix_semantic_children(self) -> None:
        result: list[Constituenta] = []
        marked: set[Constituenta] = set()
        for cst in self._items:
            if cst in marked:
                continue
            result.append(cst)
            children = self._semantic[cst.pk]['children']
            if len(children) == 0:
                continue
            for child in self._items:
                if child.pk in children:
                    marked.add(child)
                    result.append(child)
        self._items = result

    def _override_order(self) -> None:
        order = 0
        for cst in self._items:
            cst.order = order
            order += 1
        Constituenta.objects.bulk_update(self._items, ['order'])
