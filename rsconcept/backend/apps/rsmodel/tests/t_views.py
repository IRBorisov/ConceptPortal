''' Testing API: RSModels. '''
from apps.rsform.models import RSForm
from apps.rsmodel.models import ConstituentData, RSModel
from shared.EndpointTester import EndpointTester, decl_endpoint


class TestRSModelViewset(EndpointTester):
    ''' Testing RSForm view. '''

    def setUp(self):
        super().setUp()
        self.schema = RSForm.create(title='Test', alias='T1', owner=self.user)
        self.schema_id = self.schema.model.pk
        self.rsmodel = RSModel.create(self.schema.model, title='Model', alias='M1', owner=self.user)
        self.model_id = self.rsmodel.pk
        self.unowned_schema = RSForm.create(title='Test2', alias='T2', owner=self.user2)


    @decl_endpoint('/api/models/{item}/details', method='get')
    def test_details(self):
        x1 = self.schema.insert_last(alias='X1')
        cst_data = {'1': 'Петя', '2': 'Вася'}
        ConstituentData.objects.create(model=self.rsmodel.model, constituent=x1, type='basic', data=cst_data)

        response = self.executeOK(item=self.model_id)
        self.assertEqual(response.data['owner'], self.rsmodel.model.owner.pk)
        self.assertEqual(response.data['title'], self.rsmodel.model.title)
        self.assertEqual(response.data['alias'], self.rsmodel.model.alias)
        self.assertEqual(response.data['location'], self.rsmodel.model.location)
        self.assertEqual(response.data['access_policy'], self.rsmodel.model.access_policy)
        self.assertEqual(response.data['visible'], self.rsmodel.model.visible)

        schema = response.data['schema']
        self.assertEqual(schema['id'], self.schema_id)
        self.assertEqual(schema['title'], self.schema.model.title)
        self.assertEqual(schema['alias'], self.schema.model.alias)
        self.assertEqual(schema['location'], self.schema.model.location)
        self.assertEqual(schema['access_policy'], self.schema.model.access_policy)
        self.assertEqual(schema['visible'], self.schema.model.visible)

        items = response.data['items']
        self.assertEqual(len(items), 1)
        self.assertEqual(items[0]['id'], x1.pk)
        self.assertEqual(items[0]['value'], cst_data)
