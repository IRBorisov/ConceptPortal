''' Testing API: Attribution. '''
import io
import os
from zipfile import ZipFile

from cctext import ReferenceType
from rest_framework import status

from apps.library.models import AccessPolicy, LibraryItem, LibraryItemType, LocationHead
from apps.rsform.models import Attribution, Constituenta, CstType, RSForm
from shared.EndpointTester import EndpointTester, decl_endpoint
from shared.testing_utils import response_contains


class TestAttributionsEndpoints(EndpointTester):
    ''' Testing basic Attribution API. '''

    def setUp(self):
        super().setUp()
        self.owned = RSForm.create(title='Test', alias='T1', owner=self.user)
        self.owned_id = self.owned.model.pk
        self.unowned = RSForm.create(title='Test2', alias='T2')
        self.unowned_id = self.unowned.model.pk
        self.n1 = self.owned.insert_last('N1')
        self.x1 = self.owned.insert_last('X1')
        self.n2 = self.owned.insert_last('N2')
        self.unowned_cst = self.unowned.insert_last('C1')
        self.invalid_id = self.n2.pk + 1337


    @decl_endpoint('/api/rsforms/{item}/create-attribution', method='post')
    def test_create_attribution(self):
        self.executeBadData({}, item=self.owned_id)

        data = {'container': self.n1.pk, 'attribute': self.invalid_id}
        self.executeBadData(data, item=self.owned_id)

        data['attribute'] = self.unowned_cst.pk
        self.executeBadData(data, item=self.owned_id)

        data['attribute'] = data['container']
        self.executeBadData(data, item=self.owned_id)

        data = {'container': self.n1.pk, 'attribute': self.x1.pk}
        self.executeBadData(data, item=self.unowned_id)

        response = self.executeCreated(data, item=self.owned_id)
        associations = response.data['attribution']
        self.assertEqual(len(associations), 1)
        self.assertEqual(associations[0]['container'], self.n1.pk)
        self.assertEqual(associations[0]['attribute'], self.x1.pk)


    @decl_endpoint('/api/rsforms/{item}/create-attribution', method='post')
    def test_create_attribution_duplicate(self):
        data = {'container': self.n1.pk, 'attribute': self.x1.pk}
        self.executeCreated(data, item=self.owned_id)
        self.executeBadData(data, item=self.owned_id)


    @decl_endpoint('/api/rsforms/{item}/delete-attribution', method='patch')
    def test_delete_attribution(self):
        data = {'container': self.n1.pk, 'attribute': self.x1.pk}
        self.executeForbidden(data, item=self.unowned_id)
        self.executeBadData(data, item=self.owned_id)

        Attribution.objects.create(
            container=self.n1,
            attribute=self.x1
        )
        self.executeForbidden(data, item=self.unowned_id)
        response = self.executeOK(data, item=self.owned_id)
        attributions = response.data['attribution']
        self.assertEqual(len(attributions), 0)


    @decl_endpoint('/api/rsforms/{item}/clear-attributions', method='patch')
    def test_clear_attributions(self):
        data = {'target': self.n1.pk}
        self.executeForbidden(data, item=self.unowned_id)
        self.executeNotFound(data, item=self.invalid_id)
        self.executeOK(data, item=self.owned_id)

        Attribution.objects.create(
            container=self.n1,
            attribute=self.x1
        )
        Attribution.objects.create(
            container=self.n1,
            attribute=self.n2
        )
        Attribution.objects.create(
            container=self.n2,
            attribute=self.n1
        )
        response = self.executeOK(data, item=self.owned_id)
        associations = response.data['attribution']
        self.assertEqual(len(associations), 1)
        self.assertEqual(associations[0]['container'], self.n2.pk)
        self.assertEqual(associations[0]['attribute'], self.n1.pk)
