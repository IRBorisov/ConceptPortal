''' Testing API: RSModels. '''
from apps.library.models import AccessPolicy, LibraryItem, LocationHead
from apps.rsform.models import CstType, RSForm
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
        self.assertEqual(schema, self.schema_id)

        items = response.data['items']
        self.assertEqual(len(items), 1)
        self.assertEqual(items[0]['id'], x1.pk)
        self.assertEqual(items[0]['value'], cst_data)

    @decl_endpoint('/api/models/{item}/set-value', method='post')
    def test_set_value(self):
        x1 = self.schema.insert_last(alias='X1')
        cst_data = {'1': 'Петя', '2': 'Вася'}
        payload = [{
            'target': x1.pk,
            'type': 'basic',
            'data': cst_data
        }]
        self.executeOK(item=self.model_id, data=payload)
        cdata = ConstituentData.objects.get(model=self.rsmodel.model, constituent=x1)
        self.assertEqual(cdata.type, 'basic')
        self.assertEqual(cdata.data, cst_data)

        self.executeNotFound(item=self.invalid_id, data=payload)
        payload[0]['target'] = self.invalid_id

        self.executeBadData(item=self.model_id, data=payload)

        schema2 = RSForm.create(title='Test2', alias='T2', owner=self.user)
        x2 = schema2.insert_last(alias='X1')
        payload[0]['target'] = x2.pk
        self.executeBadData(item=self.model_id, data=payload)

        self.login2()
        payload[0]['target'] = x1.pk
        self.executeForbidden(item=self.model_id, data=payload)

    @decl_endpoint('/api/models/{item}/set-value', method='post')
    def test_set_multiple_values(self):
        x1 = self.schema.insert_last(alias='X1')
        x2 = self.schema.insert_last(alias='X2')
        s1 = self.schema.insert_last(alias='S1', definition_formal='X1')
        cst_data1 = {'1': 'Петя', '2': 'Вася'}
        cst_data2 = {'1': 'Кот', '2': 'Слон'}
        cst_data3 = 1
        payload = [
            {
                'target': x1.pk,
                'type': 'basic',
                'data': cst_data1,
            },
            {
                'target': x2.pk,
                'type': 'basic',
                'data': cst_data2,
            },
            {
                'target': s1.pk,
                'type': 'X1',
                'data': cst_data3,
            }
        ]
        self.executeOK(item=self.model_id, data=payload)
        cdata1 = ConstituentData.objects.get(model=self.rsmodel.model, constituent=x1)
        cdata2 = ConstituentData.objects.get(model=self.rsmodel.model, constituent=x2)
        cdata3 = ConstituentData.objects.get(model=self.rsmodel.model, constituent=s1)
        self.assertEqual(cdata1.type, 'basic')
        self.assertEqual(cdata1.data, cst_data1)
        self.assertEqual(cdata2.type, 'basic')
        self.assertEqual(cdata2.data, cst_data2)
        self.assertEqual(cdata3.type, 'X1')
        self.assertEqual(cdata3.data, cst_data3)

    @decl_endpoint('/api/models/{item}/set-value', method='post')
    def test_update_value(self):
        x1 = self.schema.insert_last(alias='X1')
        initial_data = {'1': 'Петя', '2': 'Вася'}
        # Create initial value
        payload = [{
            'target': x1.pk,
            'type': 'basic',
            'data': initial_data,
        }]
        self.executeOK(item=self.model_id, data=payload)
        cdata = ConstituentData.objects.get(model=self.rsmodel.model, constituent=x1)
        self.assertEqual(cdata.type, 'basic')
        self.assertEqual(cdata.data, initial_data)

        # Update value
        updated_data = {'1': 'Кот', '2': 'Слон'}
        payload = [{
            'target': x1.pk,
            'type': 'basic',
            'data': updated_data,
        }]
        self.executeOK(item=self.model_id, data=payload)
        cdata_refreshed = ConstituentData.objects.get(model=self.rsmodel.model, constituent=x1)
        self.assertEqual(cdata_refreshed.type, 'basic')
        self.assertEqual(cdata_refreshed.data, updated_data)

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

    @decl_endpoint('/api/models/create-from-sandbox', method='post')
    def test_create_model_from_sandbox(self):
        data = {
            'item_data': {
                'title': 'Sandbox model',
                'alias': 'SM1',
                'description': 'created from sandbox',
                'location': LocationHead.PROJECTS,
                'access_policy': AccessPolicy.PROTECTED,
                'visible': False,
                'read_only': True
            },
            'schema_data': {
                'items': [
                    {
                        'id': 101,
                        'alias': 'X1',
                        'convention': '',
                        'crucial': False,
                        'cst_type': CstType.BASE,
                        'definition_formal': '',
                        'definition_raw': '',
                        'definition_resolved': '',
                        'term_raw': 'человек',
                        'term_resolved': '',
                        'term_forms': []
                    },
                    {
                        'id': 102,
                        'alias': 'S1',
                        'convention': '',
                        'crucial': False,
                        'cst_type': CstType.TERM,
                        'definition_formal': 'X1',
                        'definition_raw': '',
                        'definition_resolved': '',
                        'term_raw': '',
                        'term_resolved': '',
                        'term_forms': []
                    }
                ],
                'attribution': [{
                    'container': 102,
                    'attribute': 101
                }]
            },
            'model_data': {
                'items': [
                    {
                        'id': 101,
                        'type': 'basic',
                        'value': {'1': 'Петя'}
                    },
                    {
                        'id': 102,
                        'type': 'X1',
                        'value': 1
                    }
                ]
            }
        }

        response = self.executeCreated(data)
        self.assertEqual(response.data['owner'], self.user.pk)
        self.assertEqual(response.data['title'], data['item_data']['title'])
        self.assertEqual(response.data['alias'], data['item_data']['alias'])
        self.assertEqual(response.data['location'], data['item_data']['location'])
        self.assertEqual(response.data['access_policy'], data['item_data']['access_policy'])
        self.assertEqual(response.data['visible'], data['item_data']['visible'])
        self.assertEqual(response.data['read_only'], data['item_data']['read_only'])

        model_item = LibraryItem.objects.get(pk=response.data['id'])
        rsmodel = RSModel.objects.get(model=model_item)
        self.assertIsNotNone(rsmodel.schema_id)

        schema = RSForm(model=rsmodel.schema)
        schema_items = list(schema.constituentsQ().order_by('order'))
        self.assertEqual(len(schema_items), 2)
        self.assertEqual(schema_items[0].alias, 'X1')
        self.assertEqual(schema_items[1].alias, 'S1')

        bindings = list(ConstituentData.objects.filter(model=model_item).select_related('constituent'))
        self.assertEqual(len(bindings), 2)
        by_alias = {binding.constituent.alias: binding for binding in bindings}
        self.assertEqual(by_alias['X1'].type, 'basic')
        self.assertEqual(by_alias['X1'].data, {'1': 'Петя'})
        self.assertEqual(by_alias['S1'].type, 'X1')
        self.assertEqual(by_alias['S1'].data, 1)

    @decl_endpoint('/api/models/create-from-sandbox', method='post')
    def test_create_model_from_sandbox_validation(self):
        data = {
            'item_data': {
                'title': 'Sandbox model',
                'alias': 'SM1',
                'description': '',
                'location': LocationHead.USER,
                'access_policy': AccessPolicy.PUBLIC,
                'visible': True,
                'read_only': False
            },
            'schema_data': {
                'items': [{
                    'id': 1,
                    'alias': 'X1',
                    'cst_type': CstType.BASE
                }],
                'attribution': []
            },
            'model_data': {
                'items': [{
                    'id': 999,
                    'type': 'basic',
                    'value': {'1': 'bad'}
                }]
            }
        }
        self.executeBadData(data)

        self.logout()
        self.executeForbidden(data)
