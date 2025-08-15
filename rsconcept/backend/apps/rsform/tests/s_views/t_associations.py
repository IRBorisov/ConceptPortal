''' Testing API: Association. '''
import io
import os
from zipfile import ZipFile

from cctext import ReferenceType
from rest_framework import status

from apps.library.models import AccessPolicy, LibraryItem, LibraryItemType, LocationHead
from apps.rsform.models import Association, Constituenta, CstType, RSForm
from shared.EndpointTester import EndpointTester, decl_endpoint
from shared.testing_utils import response_contains


class TestAssociationsEndpoints(EndpointTester):
    ''' Testing basic Association API. '''

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


    @decl_endpoint('/api/rsforms/{item}/create-association', method='post')
    def test_create_association(self):
        self.executeBadData({}, item=self.owned_id)

        data = {'container': self.n1.pk, 'associate': self.invalid_id}
        self.executeBadData(data, item=self.owned_id)

        data['associate'] = self.unowned_cst.pk
        self.executeBadData(data, item=self.owned_id)

        data['associate'] = data['container']
        self.executeBadData(data, item=self.owned_id)

        data = {'container': self.n1.pk, 'associate': self.x1.pk}
        self.executeBadData(data, item=self.unowned_id)

        response = self.executeCreated(data, item=self.owned_id)
        associations = response.data['association']
        self.assertEqual(len(associations), 1)
        self.assertEqual(associations[0]['container'], self.n1.pk)
        self.assertEqual(associations[0]['associate'], self.x1.pk)


    @decl_endpoint('/api/rsforms/{item}/create-association', method='post')
    def test_create_association_duplicate(self):
        data = {'container': self.n1.pk, 'associate': self.x1.pk}
        self.executeCreated(data, item=self.owned_id)
        self.executeBadData(data, item=self.owned_id)


    @decl_endpoint('/api/rsforms/{item}/delete-association', method='patch')
    def test_delete_association(self):
        data = {'container': self.n1.pk, 'associate': self.x1.pk}
        self.executeForbidden(data, item=self.unowned_id)
        self.executeBadData(data, item=self.owned_id)

        Association.objects.create(
            container=self.n1,
            associate=self.x1
        )
        self.executeForbidden(data, item=self.unowned_id)
        response = self.executeOK(data, item=self.owned_id)
        associations = response.data['association']
        self.assertEqual(len(associations), 0)


    @decl_endpoint('/api/rsforms/{item}/clear-associations', method='patch')
    def test_clear_associations(self):
        data = {'target': self.n1.pk}
        self.executeForbidden(data, item=self.unowned_id)
        self.executeNotFound(data, item=self.invalid_id)
        self.executeOK(data, item=self.owned_id)

        Association.objects.create(
            container=self.n1,
            associate=self.x1
        )
        Association.objects.create(
            container=self.n1,
            associate=self.n2
        )
        Association.objects.create(
            container=self.n2,
            associate=self.n1
        )
        response = self.executeOK(data, item=self.owned_id)
        associations = response.data['association']
        self.assertEqual(len(associations), 1)
        self.assertEqual(associations[0]['container'], self.n2.pk)
        self.assertEqual(associations[0]['associate'], self.n1.pk)
