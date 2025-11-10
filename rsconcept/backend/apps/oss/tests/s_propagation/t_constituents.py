''' Testing API: Change constituents in OSS. '''

from apps.oss.models import OperationSchema, OperationType, PropagationFacade
from apps.rsform.models import Attribution, Constituenta, CstType, RSForm
from shared.EndpointTester import EndpointTester, decl_endpoint


class TestChangeConstituents(EndpointTester):
    ''' Testing Constituents change propagation in OSS. '''

    def setUp(self):
        super().setUp()
        self.owned = OperationSchema.create(
            title='Test',
            alias='T1',
            owner=self.user
        )
        self.owned_id = self.owned.model.pk

        self.ks1 = RSForm.create(
            alias='KS1',
            title='Test1',
            owner=self.user
        )
        self.ks1X1 = self.ks1.insert_last('X4')
        self.ks1X2 = self.ks1.insert_last('X5')

        self.ks2 = RSForm.create(
            alias='KS2',
            title='Test2',
            owner=self.user
        )
        self.ks2X1 = self.ks2.insert_last('X1')
        self.ks2D1 = self.ks2.insert_last(
            alias='D1',
            definition_formal=r'X1\X1'
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
        self.assertEqual(self.ks3.constituentsQ().count(), 4)

        self.layout_data = [
            {'nodeID': 'o' + str(self.operation1.pk), 'x': 0, 'y': 0, 'width': 150, 'height': 40},
            {'nodeID': 'o' + str(self.operation2.pk), 'x': 0, 'y': 0, 'width': 150, 'height': 40},
            {'nodeID': 'o' + str(self.operation3.pk), 'x': 0, 'y': 0, 'width': 150, 'height': 40},
        ]
        layout = OperationSchema.layoutQ(self.owned_id)
        layout.data = self.layout_data
        layout.save()


    @decl_endpoint('/api/rsforms/{item}/details', method='get')
    def test_retrieve_inheritance(self):
        response = self.executeOK(item=self.ks3.model.pk)
        self.assertEqual(response.data['oss'], [{'id': self.owned.model.pk, 'alias': 'T1'}])
        self.assertEqual(response.data['inheritance'], [
            {
                'child': Constituenta.objects.get(as_child__parent_id=self.ks1X1.pk).pk,
                'child_source': self.ks3.model.pk,
                'parent': self.ks1X1.pk, 'parent_source': self.ks1.model.pk
            },
            {
                'child': Constituenta.objects.get(as_child__parent_id=self.ks1X2.pk).pk,
                'child_source': self.ks3.model.pk,
                'parent': self.ks1X2.pk, 'parent_source': self.ks1.model.pk
            },
            {
                'child': Constituenta.objects.get(as_child__parent_id=self.ks2X1.pk).pk,
                'child_source': self.ks3.model.pk,
                'parent': self.ks2X1.pk, 'parent_source': self.ks2.model.pk
            },
            {
                'child': Constituenta.objects.get(as_child__parent_id=self.ks2D1.pk).pk,
                'child_source': self.ks3.model.pk,
                'parent': self.ks2D1.pk, 'parent_source': self.ks2.model.pk
            },
        ])


    @decl_endpoint('/api/rsforms/{item}/create-cst', method='post')
    def test_create_constituenta(self):
        data = {
            'alias': 'X3',
            'cst_type': CstType.BASE,
            'definition_formal': 'X4 = X5'
        }
        response = self.executeCreated(data, item=self.ks1.model.pk)
        new_cst = Constituenta.objects.get(pk=response.data['new_cst']['id'])
        inherited_cst = Constituenta.objects.get(as_child__parent_id=new_cst.pk)
        self.assertEqual(self.ks1.constituentsQ().count(), 3)
        self.assertEqual(self.ks3.constituentsQ().count(), 5)
        self.assertEqual(inherited_cst.alias, 'X4')
        self.assertEqual(inherited_cst.order, 2)
        self.assertEqual(inherited_cst.definition_formal, 'X1 = X2')


    @decl_endpoint('/api/rsforms/{item}/update-cst', method='patch')
    def test_update_constituenta(self):
        d2 = self.ks3.insert_last('D2', cst_type=CstType.TERM, definition_raw='@{X1|sing,nomn}')
        data = {
            'target': self.ks1X1.pk,
            'item_data': {
                'term_raw': 'Test1',
                'definition_formal': r'X4\X4',
                'definition_raw': '@{X5|sing,datv}',
                'convention': 'test',
                'crucial': True,
            }
        }
        self.executeOK(data, item=self.ks1.model.pk)
        self.ks1X1.refresh_from_db()
        d2.refresh_from_db()
        inherited_cst = Constituenta.objects.get(as_child__parent_id=self.ks1X1.pk)
        self.assertEqual(self.ks1X1.term_raw, data['item_data']['term_raw'])
        self.assertEqual(self.ks1X1.definition_formal, data['item_data']['definition_formal'])
        self.assertEqual(self.ks1X1.definition_raw, data['item_data']['definition_raw'])
        self.assertEqual(self.ks1X1.convention, data['item_data']['convention'])
        self.assertEqual(self.ks1X1.crucial, data['item_data']['crucial'])
        self.assertEqual(d2.definition_resolved, data['item_data']['term_raw'])
        self.assertEqual(inherited_cst.term_raw, data['item_data']['term_raw'])
        self.assertEqual(inherited_cst.convention, data['item_data']['convention'])
        self.assertEqual(inherited_cst.crucial, False)
        self.assertEqual(inherited_cst.definition_formal, r'X1\X1')
        self.assertEqual(inherited_cst.definition_raw, r'@{X2|sing,datv}')


    @decl_endpoint('/api/rsforms/{item}/delete-multiple-cst', method='patch')
    def test_delete_constituenta(self):
        data = {'items': [self.ks2X1.pk]}
        self.executeOK(data, item=self.ks2.model.pk)
        inherited_cst = Constituenta.objects.get(as_child__parent_id=self.ks2D1.pk)
        self.ks2D1.refresh_from_db()
        self.assertEqual(self.ks2.constituentsQ().count(), 1)
        self.assertEqual(self.ks3.constituentsQ().count(), 3)
        self.assertEqual(self.ks2D1.definition_formal, r'DEL\DEL')
        self.assertEqual(inherited_cst.definition_formal, r'DEL\DEL')


    @decl_endpoint('/api/rsforms/{item}/substitute', method='patch')
    def test_substitute(self):
        d2 = self.ks3.insert_last('D2', cst_type=CstType.TERM, definition_formal=r'X1\X2\X3')
        data = {'substitutions': [{
            'original': self.ks1X1.pk,
            'substitution': self.ks1X2.pk
        }]}
        self.executeOK(data, item=self.ks1.model.pk)
        self.ks1X2.refresh_from_db()
        d2.refresh_from_db()
        self.assertEqual(self.ks1.constituentsQ().count(), 1)
        self.assertEqual(self.ks3.constituentsQ().count(), 4)
        self.assertEqual(self.ks1X2.order, 0)
        self.assertEqual(d2.definition_formal, r'X2\X2\X3')


    @decl_endpoint('/api/rsforms/{item}/create-attribution', method='post')
    def test_create_attribution(self):
        x1_child = Constituenta.objects.get(as_child__parent_id=self.ks1X1.pk)
        x2_child = Constituenta.objects.get(as_child__parent_id=self.ks1X2.pk)

        data = {'container': x1_child.pk, 'attribute': x2_child.pk}
        self.executeBadData(data, item=self.ks3.model.pk)

        data = {'container': self.ks1X1.pk, 'attribute': self.ks1X2.pk}
        self.executeCreated(data, item=self.ks1.model.pk)
        self.assertTrue(Attribution.objects.filter(container=x1_child, attribute=x2_child).exists())

        ks2x1_child = Constituenta.objects.get(as_child__parent_id=self.ks2X1.pk)
        data = {'container': x1_child.pk, 'attribute': ks2x1_child.pk}
        self.executeCreated(data, item=self.ks3.model.pk)
        self.assertTrue(Attribution.objects.filter(container=x1_child, attribute=ks2x1_child).exists())


    @decl_endpoint('/api/rsforms/{item}/create-attribution', method='post')
    def test_create_attribution_substitution(self):
        self.operation3.result.delete()
        self.owned.set_substitutions(self.operation3.pk, [{
            'original': self.ks1X1,
            'substitution': self.ks2X1
        }])
        self.owned.execute_operation(self.operation3)
        self.operation3.refresh_from_db()
        self.ks3 = RSForm(self.operation3.result)
        ks2x1_child = Constituenta.objects.get(as_child__parent_id=self.ks2X1.pk)
        ks1x2_child = Constituenta.objects.get(as_child__parent_id=self.ks1X2.pk)
        ks2d1_child = Constituenta.objects.get(as_child__parent_id=self.ks2D1.pk)

        data = {'container': ks1x2_child.pk, 'attribute': ks2x1_child.pk}
        self.executeBadData(data, item=self.ks3.model.pk)

        data = {'container': ks2d1_child.pk, 'attribute': ks2x1_child.pk}
        self.executeBadData(data, item=self.ks3.model.pk)

        data = {'container': self.ks1X1.pk, 'attribute': self.ks1X2.pk}
        self.executeCreated(data, item=self.ks1.model.pk)
        self.assertTrue(Attribution.objects.filter(container=self.ks1X1, attribute=self.ks1X2).exists())
        self.assertTrue(Attribution.objects.filter(container=ks2x1_child, attribute=ks1x2_child).exists())

        self.executeBadData(data, item=self.ks1.model.pk)


    @decl_endpoint('/api/rsforms/{item}/delete-attribution', method='patch')
    def test_delete_attribution(self):
        attr = Attribution.objects.create(container=self.ks1X1, attribute=self.ks1X2)
        PropagationFacade().after_create_attribution(self.ks1.model.pk, [attr])
        x1_child = Constituenta.objects.get(as_child__parent_id=self.ks1X1.pk)
        x2_child = Constituenta.objects.get(as_child__parent_id=self.ks1X2.pk)
        self.assertTrue(Attribution.objects.filter(container=x1_child, attribute=x2_child).exists())

        data = {'container': x1_child.pk, 'attribute': x2_child.pk}
        self.executeBadData(data, item=self.ks3.model.pk)

        data = {'container': self.ks1X1.pk, 'attribute': self.ks1X2.pk}
        self.executeOK(data, item=self.ks1.model.pk)
        self.assertFalse(Attribution.objects.filter(container=x1_child, attribute=x2_child).exists())
        self.assertFalse(Attribution.objects.filter(container=self.ks1X1, attribute=self.ks1X2).exists())

        self.executeBadData(data, item=self.ks3.model.pk)


    @decl_endpoint('/api/rsforms/{item}/delete-attribution', method='patch')
    def test_delete_attribution_diamond_right(self):
        Attribution.objects.create(container=self.ks1X1, attribute=self.ks1X2)
        Attribution.objects.create(container=self.ks2X1, attribute=self.ks2D1)
        self.operation3.result.delete()
        self.owned.set_substitutions(self.operation3.pk, [{
            'original': self.ks1X1,
            'substitution': self.ks2X1
        }, {
            'original': self.ks1X2,
            'substitution': self.ks2D1
        }])
        self.owned.execute_operation(self.operation3)
        self.operation3.refresh_from_db()
        self.ks3 = RSForm(self.operation3.result)
        x1_child = Constituenta.objects.get(as_child__parent_id=self.ks2X1.pk)
        x2_child = Constituenta.objects.get(as_child__parent_id=self.ks2D1.pk)
        self.assertTrue(Attribution.objects.filter(container=x1_child, attribute=x2_child).exists())

        data = {'container': self.ks2X1.pk, 'attribute': self.ks2D1.pk}
        self.executeOK(data, item=self.ks2.model.pk)
        self.assertFalse(Attribution.objects.filter(container=self.ks2X1, attribute=self.ks2D1).exists())
        self.assertTrue(Attribution.objects.filter(container=self.ks1X1, attribute=self.ks1X2).exists())
        self.assertTrue(Attribution.objects.filter(container=x1_child, attribute=x2_child).exists())

        data = {'container': self.ks1X1.pk, 'attribute': self.ks1X2.pk}
        self.executeOK(data, item=self.ks1.model.pk)
        self.assertFalse(Attribution.objects.filter(container=self.ks1X1, attribute=self.ks1X2).exists())
        self.assertFalse(Attribution.objects.filter(container=x1_child, attribute=x2_child).exists())


    @decl_endpoint('/api/rsforms/{item}/delete-attribution', method='patch')
    def test_delete_attribution_diamond_left(self):
        Attribution.objects.create(container=self.ks1X1, attribute=self.ks1X2)
        Attribution.objects.create(container=self.ks2X1, attribute=self.ks2D1)
        self.operation3.result.delete()
        self.owned.set_substitutions(self.operation3.pk, [{
            'original': self.ks1X1,
            'substitution': self.ks2X1
        }, {
            'original': self.ks1X2,
            'substitution': self.ks2D1
        }])
        self.owned.execute_operation(self.operation3)
        self.operation3.refresh_from_db()
        self.ks3 = RSForm(self.operation3.result)
        x1_child = Constituenta.objects.get(as_child__parent_id=self.ks2X1.pk)
        x2_child = Constituenta.objects.get(as_child__parent_id=self.ks2D1.pk)
        self.assertTrue(Attribution.objects.filter(container=x1_child, attribute=x2_child).exists())

        data = {'container': self.ks1X1.pk, 'attribute': self.ks1X2.pk}
        self.executeOK(data, item=self.ks1.model.pk)
        self.assertTrue(Attribution.objects.filter(container=self.ks2X1, attribute=self.ks2D1).exists())
        self.assertFalse(Attribution.objects.filter(container=self.ks1X1, attribute=self.ks1X2).exists())
        self.assertTrue(Attribution.objects.filter(container=x1_child, attribute=x2_child).exists())

        data = {'container': self.ks2X1.pk, 'attribute': self.ks2D1.pk}
        self.executeOK(data, item=self.ks2.model.pk)
        self.assertFalse(Attribution.objects.filter(container=self.ks2X1, attribute=self.ks2D1).exists())
        self.assertFalse(Attribution.objects.filter(container=self.ks1X1, attribute=self.ks1X2).exists())
        self.assertFalse(Attribution.objects.filter(container=x1_child, attribute=x2_child).exists())


    @decl_endpoint('/api/rsforms/{item}/clear-attributions', method='patch')
    def test_clear_attributions(self):
        Attribution.objects.create(container=self.ks1X1, attribute=self.ks1X2)
        self.operation3.result.delete()
        self.owned.execute_operation(self.operation3)
        self.operation3.refresh_from_db()
        self.ks3 = RSForm(self.operation3.result)
        ks1x1_child = Constituenta.objects.get(as_child__parent_id=self.ks1X1.pk)
        ks1x2_child = Constituenta.objects.get(as_child__parent_id=self.ks1X2.pk)
        ks2x1_child = Constituenta.objects.get(as_child__parent_id=self.ks2X1.pk)
        Attribution.objects.create(container=ks1x1_child, attribute=ks2x1_child)
        data = {'target': ks1x1_child.pk}
        self.executeOK(data, item=self.ks3.model.pk)

        self.assertTrue(Attribution.objects.filter(container=self.ks1X1, attribute=self.ks1X2).exists())
        self.assertTrue(Attribution.objects.filter(container=ks1x1_child, attribute=ks1x2_child).exists())
        self.assertFalse(Attribution.objects.filter(container=ks1x1_child, attribute=ks2x1_child).exists())
