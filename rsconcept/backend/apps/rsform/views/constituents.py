''' Endpoints for Constituenta. '''
from rest_framework import generics, permissions
from drf_spectacular.utils import extend_schema, extend_schema_view

from .. import models as m
from .. import serializers as s
from .. import utils


@extend_schema(tags=['Constituenta'])
@extend_schema_view()
class ConstituentAPIView(generics.RetrieveUpdateAPIView):
    ''' Endpoint: Get / Update Constituenta. '''
    queryset = m.Constituenta.objects.all()
    serializer_class = s.CstSerializer

    def get_permissions(self):
        result = super().get_permissions()
        if self.request.method.upper() == 'GET':
            result.append(permissions.AllowAny())
        else:
            result.append(utils.SchemaOwnerOrAdmin())
        return result
