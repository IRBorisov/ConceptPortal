''' Endpoints for Constituenta. '''
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import generics

from .. import models as m
from .. import permissions
from .. import serializers as s


@extend_schema(tags=['Constituenta'])
@extend_schema_view()
class ConstituentAPIView(generics.RetrieveUpdateAPIView, permissions.EditorMixin):
    ''' Endpoint: Get / Update Constituenta. '''
    queryset = m.Constituenta.objects.all()
    serializer_class = s.CstSerializer
