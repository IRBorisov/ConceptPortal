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
        self.invalid_id = self.model_id + self.schema_id + 42


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

    @decl_endpoint('/api/models/{item}/set-value', method='post')
    def test_set_value(self):
        x1 = self.schema.insert_last(alias='X1')
        cst_data = {'1': 'Петя', '2': 'Вася'}
        payload = {
            'target': x1.pk,
            'type': 'basic',
            'data': cst_data
        }
        self.executeOK(item=self.model_id, data=payload)
        cdata = ConstituentData.objects.get(model=self.rsmodel.model, constituent=x1)
        self.assertEqual(cdata.type, 'basic')
        self.assertEqual(cdata.data, cst_data)

        self.executeNotFound(item=self.invalid_id, data=payload)
        payload['target'] = self.invalid_id

        self.executeBadData(item=self.model_id, data=payload)

        schema2 = RSForm.create(title='Test2', alias='T2', owner=self.user)
        x2 = schema2.insert_last(alias='X1')
        payload['target'] = x2.pk
        self.executeBadData(item=self.model_id, data=payload)

        self.login2()
        payload['target'] = x1.pk
        self.executeForbidden(item=self.model_id, data=payload)

    @decl_endpoint('/api/models/{item}/clear-values', method='post')
    def test_clear_values(self):
        x1 = self.schema.insert_last(alias='X1')
        x2 = self.schema.insert_last(alias='X2')
        x3 = self.schema.insert_last(alias='X3')
        ConstituentData.objects.create(
            model=self.rsmodel.model,
            constituent=x1,
            type='basic',
            data={'v': 1},
        )
        ConstituentData.objects.create(
            model=self.rsmodel.model,
            constituent=x2,
            type='basic',
            data={'v': 2},
        )
        ConstituentData.objects.create(
            model=self.rsmodel.model,
            constituent=x3,
            type='basic',
            data={'v': 3},
        )

        payload = {'items': [x1.pk, x3.pk]}
        self.executeOK(item=self.model_id, data=payload)

        remaining = ConstituentData.objects.filter(model=self.rsmodel.model)
        self.assertEqual(remaining.count(), 1)
        self.assertEqual(remaining.first().constituent_id, x2.pk)

        self.executeNotFound(item=self.invalid_id, data=payload)

        payload['items'] = [self.invalid_id]
        self.executeBadData(item=self.model_id, data=payload)

        schema2 = RSForm.create(title='TestX', alias='TX', owner=self.user)
        x_other = schema2.insert_last(alias='X1')

        payload['items'] = [x_other.pk]
        self.executeBadData(item=self.model_id, data=payload)

        self.login2()
        payload['items'] = [x2.pk]
        self.executeForbidden(item=self.model_id, data=payload)

    @decl_endpoint('/api/models/{item}/reset-all', method='post')
    def test_reset_all(self):
        x1 = self.schema.insert_last(alias='X1')
        x2 = self.schema.insert_last(alias='X2')

        ConstituentData.objects.create(
            model=self.rsmodel.model,
            constituent=x1,
            type='basic',
            data={'v': 1},
        )
        ConstituentData.objects.create(
            model=self.rsmodel.model,
            constituent=x2,
            type='basic',
            data={'v': 2},
        )

        self.executeOK(item=self.model_id)
        self.assertFalse(ConstituentData.objects.filter(model=self.rsmodel.model).exists())
        self.executeOK(item=self.model_id)

        self.executeNotFound(item=self.invalid_id)

        self.login2()
        self.executeForbidden(item=self.model_id)
