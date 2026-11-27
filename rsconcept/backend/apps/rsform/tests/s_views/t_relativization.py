''' Test standalone relativization through the schema API. '''
from rest_framework import status

from apps.library.models import AccessPolicy, LibraryItem, LocationHead
from apps.oss.models import Operation
from apps.rsform.models import Constituenta, RSForm
from shared.EndpointTester import EndpointTester


class TestStandaloneRelativization(EndpointTester):
    ''' Exercise both save paths with the real projection calculator. '''

    def setUp(self):
        super().setUp()
        self.source = RSForm.create(
            alias='Source', title='Source', owner=self.user, location=LocationHead.PROJECTS,
        )
        target = self.source.insert_last('X1', term_raw='Vertices', convention='Vertices in the source.')
        self.source.insert_last('D1', definition_formal='X1')
        self.source.model.refresh_from_db()
        self.url = f'/api/rsforms/{self.source.model.pk}'
        self.parameters = {
            'source_time_update': self.source.model.time_update.isoformat(),
            'target': target.pk,
            'excluded': [],
            'locale': 'en',
            'context_name': 'context',
        }
        self.result_data = {'alias': 'Relative', 'title': 'Relative vertices'}

    def test_create_from_read_only_source_without_review(self):
        self.source.model.read_only = True
        self.source.model.save(update_fields=['read_only'])
        self.login2()
        response = self.client.post(f'{self.url}/create-relativization', self.parameters | {
            'item_data': self.result_data, 'skip_review': True,
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        result_id = response.data['id']
        self.assertEqual(response.data['owner'], self.user2.pk)
        self.assertEqual(response.data['location'], LocationHead.USER)
        self.assertFalse(response.data['read_only'])
        self.assertFalse(Operation.objects.filter(result_id=result_id).exists())
        rows = Constituenta.objects.filter(schema_id=result_id)
        definitions = {row.alias: row.definition_formal for row in rows}
        self.assertEqual(rows.get(alias='S1').term_raw, self.parameters['context_name'])
        self.assertEqual(definitions['S1'], '\u212c\u212c(X1)')
        self.assertEqual(definitions['D1'], 'I{(c, v) | c:\u2208S1; v:=c}')
        self.source.model.refresh_from_db()
        self.assertEqual(self.source.model.time_update.isoformat(), self.parameters['source_time_update'])

    def test_review_is_checked_against_the_current_projection(self):
        response = self.client.post(f'{self.url}/preview-relativization', self.parameters, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        draft = response.data
        axis = next(item for item in draft['items'] if item['alias'] == 'S1')
        self.assertEqual(axis['term_raw'], self.parameters['context_name'])
        reviewed = [row['id'] for row in draft['proposals'] if row['inKernel'] and row['changed']]
        request_data = self.parameters | {
            'item_data': self.result_data,
            'revision': draft['revision'],
            'reviewed': reviewed,
            'edits': [{
                'id': axis['id'], 'term_raw': 'Reviewed family', 'definition_raw': axis['definition_raw'],
                'convention': 'Reviewed context.',
            }],
        }
        url = f'{self.url}/create-relativization'
        for overrides, expected in [
            ({'source_time_update': '2000-01-01T00:00:00Z'}, status.HTTP_409_CONFLICT),
            ({'context_name': 'Different context'}, status.HTTP_409_CONFLICT),
            ({'reviewed': []}, status.HTTP_400_BAD_REQUEST),
            ({'schema_data': {'items': []}}, status.HTTP_400_BAD_REQUEST),
        ]:
            with self.subTest(overrides=overrides):
                response = self.client.post(url, request_data | overrides, format='json')
                self.assertEqual(response.status_code, expected, response.data)
        self.assertFalse(LibraryItem.objects.filter(alias=self.result_data['alias']).exists())

        response = self.client.post(url, request_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        result_axis = Constituenta.objects.get(schema_id=response.data['id'], alias='S1')
        self.assertEqual(result_axis.term_raw, 'Reviewed family')
        self.assertEqual(result_axis.convention, 'Reviewed context.')
        self.assertEqual(response.data['location'], LocationHead.PROJECTS)

    def test_result_from_owned_shared_library_folder_goes_to_personal_location(self):
        self.toggle_admin()
        response = self.client.patch(f'/api/library/{self.source.model.pk}/set-location', {
            'location': '/L/Examples',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.toggle_admin(False)

        response = self.client.post(f'{self.url}/create-relativization', self.parameters | {
            'item_data': self.result_data, 'skip_review': True,
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        self.assertEqual(response.data['location'], LocationHead.USER)

    def test_requires_read_access_on_both_routes(self):
        self.source.model.access_policy = AccessPolicy.PRIVATE
        self.source.model.save(update_fields=['access_policy'])
        self.login2()
        preview = self.client.post(f'{self.url}/preview-relativization', self.parameters, format='json')
        create = self.client.post(f'{self.url}/create-relativization', self.parameters | {
            'item_data': self.result_data, 'skip_review': True,
        }, format='json')
        self.assertEqual(preview.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(create.status_code, status.HTTP_403_FORBIDDEN)
