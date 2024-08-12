''' Models: Change propagation facade - managing all changes in OSS. '''
from apps.library.models import LibraryItem
from apps.rsform.models import Constituenta, RSForm

from .ChangeManager import ChangeManager


def _get_oss_hosts(item: LibraryItem) -> list[LibraryItem]:
    ''' Get all hosts for LibraryItem. '''
    return list(LibraryItem.objects.filter(operations__result=item).only('pk'))


class PropagationFacade:
    ''' Change propagation API. '''

    @classmethod
    def after_create_cst(cls, new_cst: list[Constituenta], source: RSForm) -> None:
        ''' Trigger cascade resolutions when new constituent is created. '''
        hosts = _get_oss_hosts(source.model)
        for host in hosts:
            ChangeManager(host).after_create_cst(new_cst, source)

    @classmethod
    def after_change_cst_type(cls, target: Constituenta, source: RSForm) -> None:
        ''' Trigger cascade resolutions when constituenta type is changed. '''
        hosts = _get_oss_hosts(source.model)
        for host in hosts:
            ChangeManager(host).after_change_cst_type(target, source)

    @classmethod
    def after_update_cst(cls, target: Constituenta, data: dict, old_data: dict, source: RSForm) -> None:
        ''' Trigger cascade resolutions when constituenta data is changed. '''
        hosts = _get_oss_hosts(source.model)
        for host in hosts:
            ChangeManager(host).after_update_cst(target, data, old_data, source)

    @classmethod
    def before_delete(cls, target: list[Constituenta], source: RSForm) -> None:
        ''' Trigger cascade resolutions before constituents are deleted. '''
        hosts = _get_oss_hosts(source.model)
        for host in hosts:
            ChangeManager(host).before_delete(target, source)

    @classmethod
    def before_substitute(cls, substitutions: list[tuple[Constituenta, Constituenta]], source: RSForm) -> None:
        ''' Trigger cascade resolutions before constituents are substituted. '''
        hosts = _get_oss_hosts(source.model)
        for host in hosts:
            ChangeManager(host).before_substitute(substitutions, source)
