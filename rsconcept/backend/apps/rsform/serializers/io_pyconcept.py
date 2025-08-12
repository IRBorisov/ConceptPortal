''' Data adapter to interface with pyconcept module. '''
import json
from typing import Optional, Union, cast

import pyconcept

from shared import messages as msg

from ..models import Constituenta, CstType


class PyConceptAdapter:
    ''' RSForm adapter for interacting with pyconcept module. '''

    def __init__(self, data: Union[int, dict]):
        try:
            if 'items' in cast(dict, data):
                self.data = self._prepare_request_raw(cast(dict, data))
            else:
                self.data = self._prepare_request(cast(int, data))
        except TypeError:
            self.data = self._prepare_request(cast(int, data))
        self._checked_data: Optional[dict] = None

    def parse(self) -> dict:
        ''' Check RSForm and return check results.
            Warning! Does not include texts. '''
        self._produce_response()
        if self._checked_data is None:
            raise ValueError(msg.pyconceptFailure())
        return self._checked_data

    def _prepare_request(self, schemaID: int) -> dict:
        result: dict = {
            'items': []
        }
        items = Constituenta.objects.filter(schema_id=schemaID).exclude(cst_type=CstType.NOMINAL).order_by('order')
        for cst in items:
            result['items'].append({
                'entityUID': cst.pk,
                'cstType': cst.cst_type,
                'alias': cst.alias,
                'definition': {
                    'formal': cst.definition_formal
                }
            })
        return result

    def _prepare_request_raw(self, data: dict) -> dict:
        result: dict = {
            'items': []
        }
        for cst in data['items']:
            if cst['cst_type'] == CstType.NOMINAL:
                continue
            result['items'].append({
                'entityUID': cst['id'],
                'cstType': cst['cst_type'],
                'alias': cst['alias'],
                'definition': {
                    'formal': cst['definition_formal']
                }
            })
        return result

    def _produce_response(self):
        if self._checked_data is not None:
            return
        response = pyconcept.check_schema(json.dumps(self.data))
        data = json.loads(response)
        self._checked_data = {
            'items': []
        }
        for cst in data['items']:
            self._checked_data['items'].append({
                'id': cst['entityUID'],
                'cstType': cst['cstType'],
                'alias': cst['alias'],
                'definition': {
                    'formal': cst['definition']['formal']
                },
                'parse': cst['parse']
            })
