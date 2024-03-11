''' Models: Subscription. '''
from typing import TYPE_CHECKING

from django.db.models import (
    CASCADE, ForeignKey, Model
)

from apps.users.models import User
if TYPE_CHECKING:
    from .LibraryItem import LibraryItem


class Subscription(Model):
    ''' User subscription to library item. '''
    user: ForeignKey = ForeignKey(
        verbose_name='Пользователь',
        to=User,
        on_delete=CASCADE
    )
    item: ForeignKey = ForeignKey(
        verbose_name='Элемент',
        to='rsform.LibraryItem',
        on_delete=CASCADE
    )

    class Meta:
        ''' Model metadata. '''
        verbose_name = 'Подписки'
        verbose_name_plural = 'Подписка'
        unique_together = [['user', 'item']]

    def __str__(self) -> str:
        return f'{self.user} -> {self.item}'

    @staticmethod
    def subscribe(user: User, item: 'LibraryItem') -> bool:
        ''' Add subscription. '''
        if Subscription.objects.filter(user=user, item=item).exists():
            return False
        Subscription.objects.create(user=user, item=item)
        return True

    @staticmethod
    def unsubscribe(user: User, item: 'LibraryItem') -> bool:
        ''' Remove subscription. '''
        sub = Subscription.objects.filter(user=user, item=item)
        if not sub.exists():
            return False
        sub.delete()
        return True
