"""Public reads require no Portal key; private data and mutations still enforce ACLs."""
from unittest.mock import patch

from django.core.cache import cache
from rest_framework.test import APIClient

from apps.library.models import AccessPolicy, LocationHead
from apps.rsform.models import RSForm
from shared.EndpointTester import EndpointTester


class TestAnonymousAgentReads(EndpointTester):
    def setUp(self):
        super().setUp()
        cache.clear()
        self.public = RSForm.create(title='Public synthetic schema', alias='PUBLIC', owner=self.user)
        self.public.model.access_policy = AccessPolicy.PUBLIC
        self.public.model.location = LocationHead.LIBRARY
        self.public.model.save(update_fields=['access_policy', 'location'])
        self.private = RSForm.create(title='Private synthetic schema', alias='PRIVATE', owner=self.user)
        self.private.model.access_policy = AccessPolicy.PRIVATE
        self.private.model.save(update_fields=['access_policy'])
        self.anonymous = APIClient()

    def test_public_catalog_and_details_are_anonymous(self):
        response = self.anonymous.get('/api/agents/library/active')
        self.assertEqual(response.status_code, 200, response.data)
        self.assertIn(self.public.model.pk, [row['id'] for row in response.data])
        self.assertNotIn(self.private.model.pk, [row['id'] for row in response.data])
        response = self.anonymous.get(f'/api/agents/rsforms/{self.public.model.pk}/details')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['alias'], 'PUBLIC')
        response = self.anonymous.get('/api/agents/library/by-ids', {
            'ids': f'{self.public.model.pk},{self.private.model.pk}'
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual([row['id'] for row in response.data], [self.public.model.pk])

    def test_private_details_and_all_writes_stay_protected(self):
        response = self.anonymous.get(f'/api/agents/rsforms/{self.private.model.pk}/details')
        self.assertIn(response.status_code, (401, 403))
        self.assertEqual(self.anonymous.get('/api/agents/me').status_code, 401)
        for endpoint, method in (
            ('/api/agents/rsforms', 'post'),
            (f'/api/agents/rsforms/{self.public.model.pk}/description', 'post'),
            (f'/api/agents/rsforms/{self.public.model.pk}/publish', 'post'),
            (f'/api/agents/rsforms/{self.public.model.pk}/replace', 'patch'),
        ):
            with self.subTest(endpoint=endpoint):
                self.assertEqual(getattr(self.anonymous, method)(endpoint, {}).status_code, 401)

    def test_invalid_present_key_does_not_silently_become_anonymous(self):
        self.anonymous.credentials(HTTP_AUTHORIZATION='Bearer rcp_invalid_key')
        self.assertEqual(self.anonymous.get('/api/agents/library/active').status_code, 401)

    def test_anonymous_read_limit_applies_without_user_quota(self):
        with patch('apps.agents.throttling.AnonymousAgentReadThrottle.rate', '1/min'):
            self.assertEqual(self.anonymous.get('/api/agents/library/active').status_code, 200)
            response = self.anonymous.get('/api/agents/library/active')
            self.assertEqual(response.status_code, 429)
            self.assertIn('Retry-After', response)
