''' Routing: Prompts for AI helper. '''
from rest_framework.routers import DefaultRouter

from .views import PromptTemplateViewSet

router = DefaultRouter()
router.register('prompts', PromptTemplateViewSet, 'prompt-template')

urlpatterns = router.urls
