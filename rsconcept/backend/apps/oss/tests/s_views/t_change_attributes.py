''' Testing API: Change attributes of OSS and RSForms. '''

from rest_framework import status

from apps.library.models import AccessPolicy, LocationHead
from apps.oss.models import Operation, OperationSchema, OperationType
from apps.rsform.models import RSForm
from apps.users.models import User
from shared.EndpointTester import EndpointTester, decl_endpoint


class TestChangeAttributes(EndpointTester):
    ''' Testing LibraryItem view when OSS is associated with RSForms. '''

    def setUp(self):
        super().setUp()
        self.user3 = User.objects.create(
            username='UserTest3',
            email='anotheranother@test.com',
            password='password'
        )

        self.owned = OperationSchema.create(
            title='Test',
            alias='T1',
            owner=self.user,
            location=LocationHead.LIBRARY
        )
        self.owned_id = self.owned.model.pk

        self.ks1 = RSForm.create(
            alias='KS1',
            title='Test1',
            owner=self.user,
            location=LocationHead.USER
        )
        self.ks2 = RSForm.create(
            alias='KS2',
            title='Test2',
            owner=self.user2,
            location=LocationHead.LIBRARY
        )

        self.operation1 = self.owned.create_operation(
            alias='1',
            operation_type=OperationType.INPUT,
            result=self.ks1.model
        )
        self.operation2 = self.owned.create_operation(
            alias='2',
            operation_type=OperationType.INPUT,
            result=self.ks2.model
        )

        self.operation3 = self.owned.create_operation(
            alias='3',
            operation_type=OperationType.SYNTHESIS
        )
        self.owned.execute_operation(self.operation3)
        self.operation3.refresh_from_db()
        self.ks3 = self.operation3.result


    @decl_endpoint('/api/library/{item}/set-owner', method='patch')
    def test_set_owner(self):
        data = {'user': self.user3.pk}

        self.executeOK(data=data, item=self.owned_id)

        self.owned.refresh_from_db()
        self.ks1.refresh_from_db()
        self.ks2.refresh_from_db()
        self.ks3.refresh_from_db()
        self.assertEqual(self.owned.model.owner, self.user3)
        self.assertEqual(self.ks1.model.owner, self.user)
        self.assertEqual(self.ks2.model.owner, self.user2)
        self.assertEqual(self.ks3.owner, self.user3)

    @decl_endpoint('/api/library/{item}/set-location', method='patch')
    def test_set_location(self):
        data = {'location': '/U/temp'}

        self.executeOK(data=data, item=self.owned_id)

        self.owned.refresh_from_db()
        self.ks1.refresh_from_db()
        self.ks2.refresh_from_db()
        self.ks3.refresh_from_db()
        self.assertEqual(self.owned.model.location, data['location'])
        self.assertNotEqual(self.ks1.model.location, data['location'])
        self.assertNotEqual(self.ks2.model.location, data['location'])
        self.assertEqual(self.ks3.location, data['location'])

    @decl_endpoint('/api/library/{item}/set-access-policy', method='patch')
    def test_set_access_policy(self):
        data = {'access_policy': AccessPolicy.PROTECTED}

        self.executeOK(data=data, item=self.owned_id)

        self.owned.refresh_from_db()
        self.ks1.refresh_from_db()
        self.ks2.refresh_from_db()
        self.ks3.refresh_from_db()
        self.assertEqual(self.owned.model.access_policy, data['access_policy'])
        self.assertNotEqual(self.ks1.model.access_policy, data['access_policy'])
        self.assertNotEqual(self.ks2.model.access_policy, data['access_policy'])
        self.assertEqual(self.ks3.access_policy, data['access_policy'])
