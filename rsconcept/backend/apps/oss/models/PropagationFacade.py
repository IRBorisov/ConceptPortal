''' Models: Change propagation facade - managing all changes in OSS. '''
from typing import Optional

from apps.library.models import LibraryItem
from apps.rsform.models import Attribution, Constituenta, CstType, RSFormCached

from .OperationSchemaCached import CstSubstitution, OperationSchemaCached
from .PropagationContext import PropagationContext


def _get_oss_hosts(schemaID: int) -> list[int]:
    ''' Get all hosts for schema. '''
    return list(LibraryItem.objects.filter(operations__result_id=schemaID).distinct().values_list('pk', flat=True))


class PropagationFacade:
    ''' Change propagation API. '''

    def __init__(self) -> None:
        self._context = PropagationContext()
        self._oss: dict[int, OperationSchemaCached] = {}

    def get_oss(self, schemaID: int) -> OperationSchemaCached:
        ''' Get OperationSchemaCached for schemaID. '''
        if schemaID not in self._oss:
            self._oss[schemaID] = OperationSchemaCached(schemaID, self._context)
        return self._oss[schemaID]

    def get_schema(self, schemaID: int) -> RSFormCached:
        ''' Get RSFormCached for schemaID. '''
        return self._context.get_schema(schemaID)

    def after_create_cst(self, new_cst: list[Constituenta],
                         exclude: Optional[list[int]] = None) -> None:
        ''' Trigger cascade resolutions when new constituenta is created. '''
        if not new_cst:
            return
        source = new_cst[0].schema_id
        hosts = _get_oss_hosts(source)
        for host in hosts:
            if exclude is None or host not in exclude:
                self.get_oss(host).after_create_cst(source, new_cst)

    def after_change_cst_type(self, sourceID: int, target: int, new_type: CstType,
                              exclude: Optional[list[int]] = None) -> None:
        ''' Trigger cascade resolutions when constituenta type is changed. '''
        hosts = _get_oss_hosts(sourceID)
        for host in hosts:
            if exclude is None or host not in exclude:
                self.get_oss(host).after_change_cst_type(sourceID, target, new_type)

    # pylint: disable=too-many-arguments, too-many-positional-arguments
    def after_update_cst(
        self, sourceID: int, target: int,
        data: dict, old_data: dict,
        exclude: Optional[list[int]] = None
    ) -> None:
        ''' Trigger cascade resolutions when constituenta data is changed. '''
        hosts = _get_oss_hosts(sourceID)
        for host in hosts:
            if exclude is None or host not in exclude:
                self.get_oss(host).after_update_cst(sourceID, target, data, old_data)

    def before_delete_cst(self, sourceID: int, target: list[int],
                          exclude: Optional[list[int]] = None) -> None:
        ''' Trigger cascade resolutions before constituents are deleted. '''
        hosts = _get_oss_hosts(sourceID)
        for host in hosts:
            if exclude is None or host not in exclude:
                self.get_oss(host).before_delete_cst(sourceID, target)

    def before_substitute(self, sourceID: int, substitutions: CstSubstitution,
                          exclude: Optional[list[int]] = None) -> None:
        ''' Trigger cascade resolutions before constituents are substituted. '''
        if not substitutions:
            return
        hosts = _get_oss_hosts(sourceID)
        for host in hosts:
            if exclude is None or host not in exclude:
                self.get_oss(host).before_substitute(sourceID, substitutions)

    def before_delete_schema(self, target: int, exclude: Optional[list[int]] = None) -> None:
        ''' Trigger cascade resolutions before schema is deleted. '''
        hosts = _get_oss_hosts(target)
        if not hosts:
            return

        ids = list(Constituenta.objects.filter(schema_id=target).order_by('order').values_list('pk', flat=True))
        for host in hosts:
            if exclude is None or host not in exclude:
                self.get_oss(host).before_delete_cst(target, ids)
                del self._oss[host]

    def after_create_attribution(self, sourceID: int,
                                 attributions: list[Attribution],
                                 exclude: Optional[list[int]] = None) -> None:
        ''' Trigger cascade resolutions when Attribution is created. '''
        hosts = _get_oss_hosts(sourceID)
        for host in hosts:
            if exclude is None or host not in exclude:
                self.get_oss(host).after_create_attribution(sourceID, attributions)

    def before_delete_attribution(self, sourceID: int,
                                  attributions: list[Attribution],
                                  exclude: Optional[list[int]] = None) -> None:
        ''' Trigger cascade resolutions before Attribution is deleted. '''
        hosts = _get_oss_hosts(sourceID)
        for host in hosts:
            if exclude is None or host not in exclude:
                self.get_oss(host).before_delete_attribution(sourceID, attributions)
