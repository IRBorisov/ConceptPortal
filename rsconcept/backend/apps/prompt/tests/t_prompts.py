''' Testing API: Prompts. '''
from rest_framework import status

from shared.EndpointTester import EndpointTester, decl_endpoint

from ..models import PromptTemplate


class TestPromptTemplateViewSet(EndpointTester):
    ''' Testing PromptTemplate viewset. '''

    def setUp(self):
        super().setUp()
        self.admin = self.user2
        self.admin.is_superuser = True
        self.admin.save()


    @decl_endpoint('/api/prompts/', method='post')
    def test_create_prompt(self):
        data = {
            'label': 'Test',
            'description': 'desc',
            'text': 'prompt text',
            'is_shared': False
        }
        response = self.executeCreated(data=data)
        self.assertEqual(response.data['label'], 'Test')
        self.assertEqual(response.data['owner'], self.user.pk)


    @decl_endpoint('/api/prompts/', method='post')
    def test_create_shared_prompt_by_admin(self):
        self.client.force_authenticate(user=self.admin)
        data = {
            'label': 'Shared',
            'description': 'desc',
            'text': 'prompt text',
            'is_shared': True
        }
        response = self.executeCreated(data=data)
        self.assertTrue(response.data['is_shared'])


    @decl_endpoint('/api/prompts/', method='post')
    def test_create_shared_prompt_by_user_forbidden(self):
        data = {
            'label': 'Shared',
            'description': 'desc',
            'text': 'prompt text',
            'is_shared': True
        }
        response = self.executeBadData(data=data)
        self.assertIn('is_shared', response.data)


    @decl_endpoint('/api/prompts/{item}/', method='patch')
    def test_update_prompt_owner(self):
        prompt = PromptTemplate.objects.create(owner=self.user, label='ToUpdate', description='', text='t')
        response = self.executeOK(data={'label': 'Updated'}, item=prompt.id)
        self.assertEqual(response.data['label'], 'Updated')


    @decl_endpoint('/api/prompts/{item}/', method='patch')
    def test_update_prompt_not_owner_forbidden(self):
        prompt = PromptTemplate.objects.create(owner=self.admin, label='Other', description='', text='t')
        response = self.executeForbidden(data={'label': 'Updated'}, item=prompt.id)


    @decl_endpoint('/api/prompts/{item}/', method='delete')
    def test_delete_prompt_owner(self):
        prompt = PromptTemplate.objects.create(owner=self.user, label='ToDelete', description='', text='t')
        self.executeNoContent(item=prompt.id)


    @decl_endpoint('/api/prompts/{item}/', method='delete')
    def test_delete_prompt_not_owner_forbidden(self):
        prompt = PromptTemplate.objects.create(owner=self.admin, label='Other2', description='', text='t')
        self.executeForbidden(item=prompt.id)


    @decl_endpoint('/api/prompts/available/', method='get')
    def test_available_endpoint(self):
        PromptTemplate.objects.create(
            owner=self.user,
            label='Mine',
            description='',
            text='t'
        )
        PromptTemplate.objects.create(
            owner=self.admin,
            label='Shared',
            description='',
            text='t',
            is_shared=True
        )
        response = self.executeOK()
        labels = [item['label'] for item in response.data]
        self.assertIn('Mine', labels)
        self.assertIn('Shared', labels)
        for item in response.data:
            self.assertNotIn('text', item)


    @decl_endpoint('/api/prompts/{item}/', method='patch')
    def test_permissions_on_shared(self):
        prompt = PromptTemplate.objects.create(
            owner=self.admin,
            label='Shared',
            description='',
            text='t',
            is_shared=True
        )
        self.client.force_authenticate(user=self.user)
        response = self.executeForbidden(data={'label': 'Nope'}, item=prompt.id)
