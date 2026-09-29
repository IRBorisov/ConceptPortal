''' Views: agent action log (session auth only). '''
from typing import cast

from drf_spectacular.utils import extend_schema
from rest_framework import status as c
from rest_framework.authentication import SessionAuthentication
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.models import User

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
        qs = AgentActionLog.objects.filter(user=cast(User, request.user))

        key_id = request.query_params.get('key')
        if key_id:
            parsed_key = _optional_int(key_id)
            qs = qs.filter(api_key_id=parsed_key) if parsed_key is not None else qs.none()

        action = request.query_params.get('action')
        if action:
            qs = qs.filter(action=action)

        item_id = request.query_params.get('item')
        if item_id:
            parsed_item = _optional_int(item_id)
            qs = qs.filter(item_id=parsed_item) if parsed_item is not None else qs.none()

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


def _optional_int(value: str) -> int | None:
    try:
        return int(value)
    except ValueError:
        return None
