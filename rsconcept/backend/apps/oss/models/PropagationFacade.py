''' Models: Change propagation facade - managing all changes in OSS. '''
from apps.library.models import LibraryItem, LibraryItemType
from apps.rsform.models import Constituenta, RSForm

from .OperationSchema import CstSubstitution, OperationSchema


def _get_oss_hosts(item: LibraryItem) -> list[LibraryItem]:
    ''' Get all hosts for LibraryItem. '''
    return list(LibraryItem.objects.filter(operations__result=item).only('pk'))


class PropagationFacade:
    ''' Change propagation API. '''

    @staticmethod
    def after_create_cst(new_cst: list[Constituenta], source: RSForm) -> None:
        ''' Trigger cascade resolutions when new constituent is created. '''
        hosts = _get_oss_hosts(source.model)
        for host in hosts:
            OperationSchema(host).after_create_cst(new_cst, source)

    @staticmethod
    def after_change_cst_type(target: Constituenta, source: RSForm) -> None:
        ''' Trigger cascade resolutions when constituenta type is changed. '''
        hosts = _get_oss_hosts(source.model)
        for host in hosts:
            OperationSchema(host).after_change_cst_type(target, source)

    @staticmethod
    def after_update_cst(target: Constituenta, data: dict, old_data: dict, source: RSForm) -> None:
        ''' Trigger cascade resolutions when constituenta data is changed. '''
        hosts = _get_oss_hosts(source.model)
        for host in hosts:
            OperationSchema(host).after_update_cst(target, data, old_data, source)

    @staticmethod
    def before_delete_cst(target: list[Constituenta], source: RSForm) -> None:
        ''' Trigger cascade resolutions before constituents are deleted. '''
        hosts = _get_oss_hosts(source.model)
        for host in hosts:
            OperationSchema(host).before_delete_cst(target, source)

    @staticmethod
    def before_substitute(substitutions: CstSubstitution, source: RSForm) -> None:
        ''' Trigger cascade resolutions before constituents are substituted. '''
        hosts = _get_oss_hosts(source.model)
        for host in hosts:
            OperationSchema(host).before_substitute(substitutions, source)

    @staticmethod
    def before_delete_schema(item: LibraryItem) -> None:
        ''' Trigger cascade resolutions before schema is deleted. '''
        if item.item_type != LibraryItemType.RSFORM:
            return
        hosts = _get_oss_hosts(item)
        if len(hosts) == 0:
            return

        schema = RSForm(item)
        PropagationFacade.before_delete_cst(list(schema.constituents()), schema)
