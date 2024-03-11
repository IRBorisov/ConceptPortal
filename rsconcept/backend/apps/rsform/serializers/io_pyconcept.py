''' Data adapter to interface with pyconcept module. '''
import json
from typing import Optional, cast, Union

import pyconcept

from ..models import RSForm
from .. import messages as msg


class PyConceptAdapter:
    ''' RSForm adapter for interacting with pyconcept module. '''
    def __init__(self, data: Union[RSForm, dict]):
        try:
            if 'items' in cast(dict, data):
                self.data = self._prepare_request_raw(cast(dict, data))
            else:
                self.data = self._prepare_request(cast(RSForm, data))
        except TypeError:
            self.data = self._prepare_request(cast(RSForm, data))
        self._checked_data: Optional[dict] = None

    def parse(self) -> dict:
        ''' Check RSForm and return check results.
            Warning! Does not include texts. '''
        self._produce_response()
        if self._checked_data is None:
            raise ValueError(msg.pyconceptFailure())
        return self._checked_data

    def _prepare_request(self, schema: RSForm) -> dict:
        result: dict = {
            'items': []
        }
        items = schema.constituents().order_by('order')
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
