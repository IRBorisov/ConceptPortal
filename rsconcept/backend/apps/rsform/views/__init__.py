''' REST API: Endpoint processors. '''
from .cctext import generate_lexeme, inflect, parse_text
from .rsforms import RSFormViewSet, TrsImportView, create_rsform, create_rsform_from_sandbox, inline_synthesis
