''' Models: Propagation context. '''

from apps.rsform.models import RSFormCached


class PropagationContext:
    ''' Propagation context. '''

    def __init__(self) -> None:
        self._cache: dict[int, RSFormCached] = {}

    def get_schema(self, item_id: int) -> RSFormCached:
        ''' Get schema by ID. '''
        if item_id not in self._cache:
            schema = RSFormCached(item_id)
            schema.cache.ensure_loaded()
            self._cache[item_id] = schema
        return self._cache[item_id]

    def clear(self) -> None:
        ''' Clear cache. '''
        self._cache = {}

    def invalidate(self, item_id: int | None) -> None:
        ''' Invalidate schema by ID. '''
        if item_id in self._cache:
            del self._cache[item_id]
