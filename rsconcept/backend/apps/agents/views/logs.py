''' Views: agent action log (session auth only). '''
from drf_spectacular.utils import extend_schema
from rest_framework import status as c
from rest_framework.authentication import SessionAuthentication
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import AgentActionLog
from ..permissions import IsSessionUser
from ..serializers import AgentActionLogSerializer


@extend_schema(
    tags=['Agents'],
    summary='List own agent API action log',
    responses={c.HTTP_200_OK: AgentActionLogSerializer(many=True)},
)
class AgentActionLogListView(APIView):
    ''' Paginated-ish list of agent actions for the current user. '''
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsSessionUser]

    def get(self, request: Request) -> Response:
        qs = AgentActionLog.objects.filter(user=request.user)

        key_id = request.query_params.get('key')
        if key_id:
            qs = qs.filter(api_key_id=key_id)

        action = request.query_params.get('action')
        if action:
            qs = qs.filter(action=action)

        item_id = request.query_params.get('item')
        if item_id:
            qs = qs.filter(item_id=item_id)

        try:
            limit = min(max(int(request.query_params.get('limit', 50)), 1), 200)
        except ValueError:
            limit = 50
        try:
            offset = max(int(request.query_params.get('offset', 0)), 0)
        except ValueError:
            offset = 0

        total = qs.count()
        rows = qs[offset:offset + limit]
        return Response({
            'count': total,
            'results': AgentActionLogSerializer(rows, many=True).data,
        })
