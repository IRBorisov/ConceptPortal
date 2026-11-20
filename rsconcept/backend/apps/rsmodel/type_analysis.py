''' Run the shared RSLang analyzer on the schema behind a model. '''
import json
import logging
import subprocess
from typing import TypedDict, cast

from django.conf import settings

from apps.rsform.models import Constituenta

logger = logging.getLogger(__name__)


class BindingTypeDetails(TypedDict):
    ''' Current type and comparison with the stored binding metadata. '''
    effective_type: str | None
    type_diagnostic: str | None


UNAVAILABLE_TYPE: BindingTypeDetails = {
    'effective_type': None,
    'type_diagnostic': 'effective_type_unavailable',
}


def get_binding_types(schema_id: int, bindings: list[dict]) -> list[BindingTypeDetails]:
    ''' Get one type result per binding, in binding order. '''
    constituents = Constituenta.objects.filter(schema_id=schema_id).order_by('order').values(
        'id', 'alias', 'cst_type', 'definition_formal', 'typification_manual', 'value_is_property',
    )
    payload = {
        'constituents': list(constituents),
        'bindings': [{'id': binding['id'], 'type': binding['type']} for binding in bindings],
    }
    script = settings.BASE_DIR / 'build' / 'model-types' / 'model-types.mjs'
    try:
        result = subprocess.run(
            ['node', str(script)],
            input=json.dumps(payload).encode('utf-8'),
            capture_output=True,
            timeout=5,
            check=True,
        )
        return cast(list[BindingTypeDetails], json.loads(result.stdout))
    except (OSError, subprocess.SubprocessError, ValueError) as exc:
        logger.error('RSLang analyzer failed for schema %s (%s)', schema_id, type(exc).__name__)
        return [UNAVAILABLE_TYPE] * len(bindings)
