''' Regression: routed actions declare permissions, and unknown actions fail closed. '''
from django.test import SimpleTestCase

from apps.library.views import LibraryViewSet
from apps.oss.views import OssViewSet
from apps.rsform.views import RSFormViewSet
from apps.rsmodel.views import RSModelViewSet
from shared.permissions import GlobalUser, ItemAnyone, ItemEditor, ItemOwner

_STANDARD_ACTIONS = ('list', 'create', 'retrieve', 'update', 'partial_update', 'destroy')


def _routed_actions(viewset_cls) -> set[str]:
    names = {action.__name__ for action in viewset_cls.get_extra_actions()}
    for name in _STANDARD_ACTIONS:
        if hasattr(viewset_cls, name):
            names.add(name)
    return names


_EXPECTED = {
    RSFormViewSet: {
        'list': ItemAnyone,
        'retrieve': ItemAnyone,
        'contents': ItemAnyone,
        'details': ItemAnyone,
        'resolve': ItemAnyone,
        'load_json': ItemEditor,
        'load_trs': ItemEditor,
        'create_cst': ItemEditor,
        'create_multiple_cst': ItemEditor,
        'update_cst': ItemEditor,
        'update_crucial': ItemEditor,
        'move_cst': ItemEditor,
        'delete_multiple_cst': ItemEditor,
        'substitute': ItemEditor,
        'restore_order': ItemEditor,
        'reset_aliases': ItemEditor,
        'create_attribution': ItemEditor,
        'delete_attribution': ItemEditor,
        'clear_attributions': ItemEditor,
    },
    OssViewSet: {
        'list': ItemAnyone,
        'retrieve': ItemAnyone,
        'details': ItemAnyone,
        'get_predecessor': GlobalUser,
        'update_layout': ItemEditor,
        'create_block': ItemEditor,
        'update_block': ItemEditor,
        'delete_block': ItemEditor,
        'move_items': ItemEditor,
        'create_schema': ItemEditor,
        'clone_schema': ItemEditor,
        'import_schema': ItemEditor,
        'create_replica': ItemEditor,
        'create_synthesis': ItemEditor,
        'update_operation': ItemEditor,
        'delete_operation': ItemEditor,
        'delete_replica': ItemEditor,
        'create_input': ItemEditor,
        'set_input': ItemEditor,
        'execute_operation': ItemEditor,
        'relocate_constituents': ItemEditor,
    },
    RSModelViewSet: {
        'list': ItemAnyone,
        'retrieve': ItemAnyone,
        'details': ItemAnyone,
        'load_json': ItemEditor,
        'set_value': ItemEditor,
        'clear_values': ItemEditor,
        'reset_all': ItemEditor,
    },
    LibraryViewSet: {
        'list': ItemAnyone,
        'retrieve': ItemAnyone,
        'create': GlobalUser,
        'clone': GlobalUser,
        'rename_location': GlobalUser,
        'update': ItemEditor,
        'partial_update': ItemEditor,
        'destroy': ItemOwner,
        'set_owner': ItemOwner,
        'set_access_policy': ItemOwner,
        'set_location': ItemOwner,
        'set_editors': ItemOwner,
        'set_read_only': ItemOwner,
        'set_visible': ItemOwner,
    },
}


class TestActionPermissions(SimpleTestCase):
    ''' Every routed action has an explicit permission class. '''

    def test_every_routed_action_is_mapped(self):
        for viewset_cls, expected in _EXPECTED.items():
            with self.subTest(viewset=viewset_cls.__name__):
                self.assertEqual(_routed_actions(viewset_cls), set(expected))
                view = viewset_cls()
                for action, permission_cls in expected.items():
                    view.action = action
                    permissions = view.get_permissions()
                    self.assertEqual(len(permissions), 1, action)
                    self.assertIs(type(permissions[0]), permission_cls, action)

    def test_unlisted_content_action_requires_editor(self):
        for viewset_cls in (RSFormViewSet, OssViewSet, RSModelViewSet):
            with self.subTest(viewset=viewset_cls.__name__):
                view = viewset_cls()
                view.action = 'not_a_routed_action'
                permissions = view.get_permissions()
                self.assertEqual(len(permissions), 1)
                self.assertIs(type(permissions[0]), ItemEditor)
