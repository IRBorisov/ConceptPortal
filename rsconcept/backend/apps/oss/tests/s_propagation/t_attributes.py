''' Testing API: Change attributes of OSS and RSForms. '''
from apps.library.models import AccessPolicy, Editor, LibraryItem, LocationHead
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
        self.owned.set_arguments(self.operation3.pk, [self.operation1, self.operation2])
        self.owned.execute_operation(self.operation3)
        self.operation3.refresh_from_db()
        self.ks3 = RSForm(self.operation3.result)


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
        self.assertEqual(self.ks3.model.owner, self.user3)

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
        self.assertEqual(self.ks3.model.location, data['location'])

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
        self.assertEqual(self.ks3.model.access_policy, data['access_policy'])

    @decl_endpoint('/api/library/{item}/set-editors', method='patch')
    def test_set_editors(self):
        Editor.set(self.owned.model.pk, [self.user2.pk])
        Editor.set(self.ks1.model.pk, [self.user2.pk, self.user.pk])
        Editor.set(self.ks3.model.pk, [self.user2.pk, self.user.pk])
        data = {'users': [self.user3.pk]}

        self.executeOK(data=data, item=self.owned_id)

        self.owned.refresh_from_db()
        self.ks1.refresh_from_db()
        self.ks2.refresh_from_db()
        self.ks3.refresh_from_db()
        self.assertEqual(list(self.owned.model.getQ_editors()), [self.user3])
        self.assertEqual(list(self.ks1.model.getQ_editors()), [self.user, self.user2])
        self.assertEqual(list(self.ks2.model.getQ_editors()), [])
        self.assertEqual(set(self.ks3.model.getQ_editors()), set([self.user, self.user3]))

    @decl_endpoint('/api/library/{item}', method='patch')
    def test_sync_from_result(self):
        data = {'alias': 'KS111', 'title': 'New Title', 'comment': 'New Comment'}

        self.executeOK(data=data, item=self.ks1.model.pk)
        self.operation1.refresh_from_db()

        self.assertEqual(self.operation1.result, self.ks1.model)
        self.assertEqual(self.operation1.alias, data['alias'])
        self.assertEqual(self.operation1.title, data['title'])
        self.assertEqual(self.operation1.comment, data['comment'])

    @decl_endpoint('/api/oss/{item}/update-operation', method='patch')
    def test_sync_from_operation(self):
        data = {
            'target': self.operation3.pk,
            'item_data': {
                'alias': 'Test3 mod',
                'title': 'Test title mod',
                'comment': 'Comment mod'
            },
            'positions': [],
        }

        response = self.executeOK(data=data, item=self.owned_id)
        self.ks3.refresh_from_db()
        self.assertEqual(self.ks3.model.alias, data['item_data']['alias'])
        self.assertEqual(self.ks3.model.title, data['item_data']['title'])
        self.assertEqual(self.ks3.model.comment, data['item_data']['comment'])

    @decl_endpoint('/api/library/{item}', method='delete')
    def test_destroy_oss_consequence(self):
        response = self.executeNoContent(item=self.owned_id)
        self.assertFalse(LibraryItem.objects.filter(pk=self.owned_id).exists())
        self.assertFalse(LibraryItem.objects.filter(pk=self.ks3.model.pk).exists())
        self.assertTrue(LibraryItem.objects.filter(pk=self.ks1.model.pk).exists())
