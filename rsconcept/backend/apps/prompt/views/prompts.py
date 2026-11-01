''' Views: PromptTemplate endpoints for AI prompt management. '''

from django.db import models
from django.http import Http404
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from ..models import PromptTemplate
from ..serializers import PromptTemplateListSerializer, PromptTemplateSerializer


class IsOwnerOrAdmin(permissions.BasePermission):
    '''Permission: Only owner or admin can modify, anyone can view shared.'''

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            # Allow unauthenticated users to view only shared templates
            if not request.user or not request.user.is_authenticated:
                return obj.is_shared
            return obj.is_shared or obj.owner == request.user
        return obj.owner == request.user or request.user.is_staff or request.user.is_superuser


@extend_schema(tags=['Prompts'])
class PromptTemplateViewSet(viewsets.ModelViewSet):
    '''ViewSet: CRUD and listing for PromptTemplate, with sharing logic.'''
    queryset = PromptTemplate.objects.all()
    serializer_class = PromptTemplateSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]

    def get_permissions(self):
        if self.action == 'available':
            return [AllowAny()]
        # retrieve must run IsOwnerOrAdmin: AllowAny skipped it and exposed private templates.
        # Shared templates stay readable without a session; private ones do not.
        if self.action == 'retrieve':
            return [IsOwnerOrAdmin()]
        return [permission() for permission in self.permission_classes]

    def get_queryset(self):
        user = self.request.user
        if self.action == 'available':
            return PromptTemplate.objects.none()
        return PromptTemplate.objects.filter(models.Q(owner=user) | models.Q(is_shared=True)).distinct()

    def get_object(self):
        ''' 404 for a missing id and for an id that is not an integer. '''
        try:
            obj = get_object_or_404(PromptTemplate, pk=self.kwargs['pk'])
        except (TypeError, ValueError):
            raise Http404 from None
        self.check_object_permissions(self.request, obj)
        return obj

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @extend_schema(summary='List user-owned and shared prompt templates')
    @action(detail=False, methods=['get'], url_path='available')
    def available(self, request):
        '''Return user-owned and shared prompt templates.'''
        user = request.user
        if user.is_authenticated:
            owned = PromptTemplate.objects.filter(owner=user)
            shared = PromptTemplate.objects.filter(is_shared=True)
            templates = (owned | shared).distinct()
        else:
            templates = PromptTemplate.objects.filter(is_shared=True)
        serializer = PromptTemplateListSerializer(templates, many=True)
        return Response(serializer.data)
