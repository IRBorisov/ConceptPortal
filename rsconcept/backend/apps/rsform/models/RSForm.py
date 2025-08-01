''' Models: RSForm API. '''
# pylint: disable=duplicate-code

from typing import Iterable, Optional

from cctext import Entity, Resolver, TermForm, split_grams
from django.core.exceptions import ValidationError
from django.db.models import QuerySet

from apps.library.models import LibraryItem, LibraryItemType, Version
from shared import messages as msg

from .api_RSLanguage import guess_type
from .Constituenta import Constituenta, CstType

INSERT_LAST: int = -1
DELETED_ALIAS = 'DEL'


class RSForm:
    ''' RSForm wrapper. No caching, each mutation requires querying. '''

    def __init__(self, model: LibraryItem):
        assert model.item_type == LibraryItemType.RSFORM
        self.model = model

    @staticmethod
    def create(**kwargs) -> 'RSForm':
        ''' Create LibraryItem via RSForm. '''
        model = LibraryItem.objects.create(item_type=LibraryItemType.RSFORM, **kwargs)
        return RSForm(model)

    @staticmethod
    def spawn_resolver(schemaID: int) -> Resolver:
        ''' Create resolver for text references based on schema terms. '''
        result = Resolver({})
        constituents = Constituenta.objects.filter(schema_id=schemaID).only('alias', 'term_resolved', 'term_forms')
        for cst in constituents:
            entity = Entity(
                alias=cst.alias,
                nominal=cst.term_resolved,
                manual_forms=[
                    TermForm(text=form['text'], grams=split_grams(form['tags']))
                    for form in cst.term_forms
                ]
            )
            result.context[cst.alias] = entity
        return result

    def refresh_from_db(self) -> None:
        ''' Model wrapper. '''
        self.model.refresh_from_db()

    def save(self, *args, **kwargs) -> None:
        ''' Model wrapper. '''
        self.model.save(*args, **kwargs)

    def constituentsQ(self) -> QuerySet[Constituenta]:
        ''' Get QuerySet containing all constituents of current RSForm. '''
        return Constituenta.objects.filter(schema=self.model)

    def insert_last(
        self,
        alias: str,
        cst_type: Optional[CstType] = None,
        **kwargs
    ) -> Constituenta:
        ''' Insert new constituenta at last position. '''
        if Constituenta.objects.filter(schema=self.model, alias=alias).exists():
            raise ValidationError(msg.aliasTaken(alias))
        if cst_type is None:
            cst_type = guess_type(alias)
        position = self.constituentsQ().count()
        result = Constituenta.objects.create(
            schema=self.model,
            order=position,
            alias=alias,
            cst_type=cst_type,
            **kwargs
        )
        self.model.save(update_fields=['time_update'])
        return result

    def move_cst(self, target: list[Constituenta], destination: int) -> None:
        ''' Move list of constituents to specific position. '''
        count_moved = 0
        count_top = 0
        count_bot = 0
        size = len(target)

        cst_list = Constituenta.objects.filter(schema=self.model).only('order').order_by('order')
        for cst in cst_list:
            if cst in target:
                cst.order = destination + count_moved
                count_moved += 1
            elif count_top < destination:
                cst.order = count_top
                count_top += 1
            else:
                cst.order = destination + size + count_bot
                count_bot += 1
        Constituenta.objects.bulk_update(cst_list, ['order'])
        self.save(update_fields=['time_update'])

    def delete_cst(self, target: Iterable[Constituenta]) -> None:
        ''' Delete multiple constituents. Do not check if listCst are from this schema. '''
        mapping = {cst.alias: DELETED_ALIAS for cst in target}
        self.apply_mapping(mapping)
        Constituenta.objects.filter(pk__in=[cst.pk for cst in target]).delete()
        self._reset_order()
        self.save(update_fields=['time_update'])

    def apply_mapping(self, mapping: dict[str, str], change_aliases: bool = False) -> None:
        ''' Apply rename mapping. '''
        update_list: list[Constituenta] = []
        constituents = self.constituentsQ().only('alias', 'definition_formal', 'term_raw', 'definition_raw')
        for cst in constituents:
            if cst.apply_mapping(mapping, change_aliases):
                update_list.append(cst)
        Constituenta.objects.bulk_update(update_list, ['alias', 'definition_formal', 'term_raw', 'definition_raw'])
        self.save(update_fields=['time_update'])

    def create_version(self, version: str, description: str, data) -> Version:
        ''' Creates version for current state. '''
        return Version.objects.create(
            item=self.model,
            version=version,
            description=description,
            data=data
        )

    def _reset_order(self) -> None:
        order = 0
        changed: list[Constituenta] = []
        cst_list = self.constituentsQ().only('order').order_by('order')
        for cst in cst_list:
            if cst.order != order:
                cst.order = order
                changed.append(cst)
            order += 1
        Constituenta.objects.bulk_update(changed, ['order'])
