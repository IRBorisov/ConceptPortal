''' Utilities for testing. '''

from apps.rsform.models import LibraryItem

def response_contains(response, item: LibraryItem) -> bool:
    ''' Check if response contains specific item. '''
    return any(x for x in response.data if x['id'] == item.pk)
