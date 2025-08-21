''' Models: Change propagation facade - managing all changes in OSS. '''
from typing import Optional

from apps.library.models import LibraryItem, LibraryItemType
from apps.rsform.models import Attribution, Constituenta, CstType, RSFormCached

from .OperationSchemaCached import CstSubstitution, OperationSchemaCached


def _get_oss_hosts(schemaID: int) -> list[LibraryItem]:
    ''' Get all hosts for LibraryItem. '''
    return list(LibraryItem.objects.filter(operations__result_id=schemaID).only('pk').distinct())


class PropagationFacade:
    ''' Change propagation API. '''

    @staticmethod
    def after_create_cst(source: RSFormCached, new_cst: list[Constituenta],
                         exclude: Optional[list[int]] = None) -> None:
        ''' Trigger cascade resolutions when new constituenta is created. '''
        hosts = _get_oss_hosts(source.model.pk)
        for host in hosts:
            if exclude is None or host.pk not in exclude:
                OperationSchemaCached(host).after_create_cst(source, new_cst)

    @staticmethod
    def after_change_cst_type(sourceID: int, target: int, new_type: CstType,
                              exclude: Optional[list[int]] = None) -> None:
        ''' Trigger cascade resolutions when constituenta type is changed. '''
        hosts = _get_oss_hosts(sourceID)
        for host in hosts:
            if exclude is None or host.pk not in exclude:
                OperationSchemaCached(host).after_change_cst_type(sourceID, target, new_type)

    @staticmethod
    def after_update_cst(
        source: RSFormCached,
        target: int,
        data: dict,
        old_data: dict,
        exclude: Optional[list[int]] = None
    ) -> None:
        ''' Trigger cascade resolutions when constituenta data is changed. '''
        hosts = _get_oss_hosts(source.model.pk)
        for host in hosts:
            if exclude is None or host.pk not in exclude:
                OperationSchemaCached(host).after_update_cst(source, target, data, old_data)

    @staticmethod
    def before_delete_cst(sourceID: int, target: list[int],
                          exclude: Optional[list[int]] = None) -> None:
        ''' Trigger cascade resolutions before constituents are deleted. '''
        hosts = _get_oss_hosts(sourceID)
        for host in hosts:
            if exclude is None or host.pk not in exclude:
                OperationSchemaCached(host).before_delete_cst(sourceID, target)

    @staticmethod
    def before_substitute(sourceID: int, substitutions: CstSubstitution,
                          exclude: Optional[list[int]] = None) -> None:
        ''' Trigger cascade resolutions before constituents are substituted. '''
        if not substitutions:
            return
        hosts = _get_oss_hosts(sourceID)
        for host in hosts:
            if exclude is None or host.pk not in exclude:
                OperationSchemaCached(host).before_substitute(sourceID, substitutions)

    @staticmethod
    def before_delete_schema(item: LibraryItem, exclude: Optional[list[int]] = None) -> None:
        ''' Trigger cascade resolutions before schema is deleted. '''
        if item.item_type != LibraryItemType.RSFORM:
            return
        hosts = _get_oss_hosts(item.pk)
        if not hosts:
            return

        ids = list(Constituenta.objects.filter(schema=item).order_by('order').values_list('pk', flat=True))
        for host in hosts:
            if exclude is None or host.pk not in exclude:
                OperationSchemaCached(host).before_delete_cst(item.pk, ids)

    @staticmethod
    def after_create_attribution(sourceID: int, associations: list[Attribution],
                                 exclude: Optional[list[int]] = None) -> None:
        ''' Trigger cascade resolutions when Attribution is created. '''
        hosts = _get_oss_hosts(sourceID)
        for host in hosts:
            if exclude is None or host.pk not in exclude:
                OperationSchemaCached(host).after_create_attribution(sourceID, associations)

    @staticmethod
    def before_delete_attribution(sourceID: int,
                                  associations: list[Attribution],
                                  exclude: Optional[list[int]] = None) -> None:
        ''' Trigger cascade resolutions before Attribution is deleted. '''
        hosts = _get_oss_hosts(sourceID)
        for host in hosts:
            if exclude is None or host.pk not in exclude:
                OperationSchemaCached(host).before_delete_attribution(sourceID, associations)
