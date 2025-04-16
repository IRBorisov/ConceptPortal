''' Models: Change propagation facade - managing all changes in OSS. '''
from typing import Optional

from apps.library.models import LibraryItem, LibraryItemType
from apps.rsform.models import Constituenta, RSForm

from .OperationSchema import CstSubstitution, OperationSchema


def _get_oss_hosts(item: LibraryItem) -> list[LibraryItem]:
    ''' Get all hosts for LibraryItem. '''
    return list(LibraryItem.objects.filter(operations__result=item).only('pk'))


class PropagationFacade:
    ''' Change propagation API. '''

    @staticmethod
    def after_create_cst(source: RSForm, new_cst: list[Constituenta], exclude: Optional[list[int]] = None) -> None:
        ''' Trigger cascade resolutions when new constituenta is created. '''
        hosts = _get_oss_hosts(source.model)
        for host in hosts:
            if exclude is None or host.pk not in exclude:
                OperationSchema(host).after_create_cst(source, new_cst)

    @staticmethod
    def after_change_cst_type(source: RSForm, target: Constituenta, exclude: Optional[list[int]] = None) -> None:
        ''' Trigger cascade resolutions when constituenta type is changed. '''
        hosts = _get_oss_hosts(source.model)
        for host in hosts:
            if exclude is None or host.pk not in exclude:
                OperationSchema(host).after_change_cst_type(source, target)

    @staticmethod
    def after_update_cst(
        source: RSForm,
        target: Constituenta,
        data: dict,
        old_data: dict,
        exclude: Optional[list[int]] = None
    ) -> None:
        ''' Trigger cascade resolutions when constituenta data is changed. '''
        hosts = _get_oss_hosts(source.model)
        for host in hosts:
            if exclude is None or host.pk not in exclude:
                OperationSchema(host).after_update_cst(source, target, data, old_data)

    @staticmethod
    def before_delete_cst(source: RSForm, target: list[Constituenta], exclude: Optional[list[int]] = None) -> None:
        ''' Trigger cascade resolutions before constituents are deleted. '''
        hosts = _get_oss_hosts(source.model)
        for host in hosts:
            if exclude is None or host.pk not in exclude:
                OperationSchema(host).before_delete_cst(source, target)

    @staticmethod
    def before_substitute(source: RSForm, substitutions: CstSubstitution, exclude: Optional[list[int]] = None) -> None:
        ''' Trigger cascade resolutions before constituents are substituted. '''
        hosts = _get_oss_hosts(source.model)
        for host in hosts:
            if exclude is None or host.pk not in exclude:
                OperationSchema(host).before_substitute(source, substitutions)

    @staticmethod
    def before_delete_schema(item: LibraryItem, exclude: Optional[list[int]] = None) -> None:
        ''' Trigger cascade resolutions before schema is deleted. '''
        if item.item_type != LibraryItemType.RSFORM:
            return
        hosts = _get_oss_hosts(item)
        if len(hosts) == 0:
            return

        schema = RSForm(item)
        PropagationFacade.before_delete_cst(schema, list(schema.constituents().order_by('order')), exclude)
