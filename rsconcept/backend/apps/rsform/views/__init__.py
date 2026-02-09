''' REST API: Endpoint processors. '''
from .cctext import generate_lexeme, inflect, parse_text
from .rsforms import RSFormViewSet, TrsImportView, create_rsform, inline_synthesis
