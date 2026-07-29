''' Routing: Agents API. '''
from django.urls import path
from rest_framework.routers import SimpleRouter

from . import views

router = SimpleRouter(trailing_slash=False)
router.register('agents/keys', views.ApiKeyViewSet, basename='agent-keys')

urlpatterns = [
    path('agents/logs', views.AgentActionLogListView.as_view()),
    path('agents/library/active', views.AgentLibraryActiveView.as_view()),
    path('agents/library/context-search', views.AgentLibraryContextSearchView.as_view()),
    path('agents/library/by-ids', views.AgentLibraryItemsByIdsView.as_view()),
    path('agents/rsforms', views.AgentRsformCreateView.as_view()),
    path('agents/rsforms/<int:pk>/details', views.AgentRsformDetailsView.as_view()),
    path('agents/rsforms/<int:pk>/replace', views.AgentRsformReplaceView.as_view()),
    path('agents/rsforms/<int:pk>/create-version', views.AgentRsformCreateVersionView.as_view()),
    path('agents/rsforms/<int:pk>/constituents', views.AgentCreateConstituentaView.as_view()),
    path('agents/rsforms/<int:pk>/constituents/delete', views.AgentDeleteConstituentsView.as_view()),
    path(
        'agents/rsforms/<int:pk>/constituents/<int:cst_id>',
        views.AgentUpdateConstituentaView.as_view(),
    ),
    path('agents/rsforms/<int:pk>/substitute', views.AgentSubstituteView.as_view()),
    path('agents/rsforms/<int:pk>/move-cst', views.AgentMoveCstView.as_view()),
] + router.urls
