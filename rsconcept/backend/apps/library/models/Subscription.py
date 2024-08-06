''' Models: Subscription. '''
from django.db.models import CASCADE, ForeignKey, Model

from apps.users.models import User


class Subscription(Model):
    ''' User subscription to library item. '''
    user: ForeignKey = ForeignKey(
        verbose_name='Пользователь',
        to=User,
        on_delete=CASCADE
    )
    item: ForeignKey = ForeignKey(
        verbose_name='Элемент',
        to='library.LibraryItem',
        on_delete=CASCADE
    )

    class Meta:
        ''' Model metadata. '''
        verbose_name = 'Подписка'
        verbose_name_plural = 'Подписки'
        unique_together = [['user', 'item']]

    def __str__(self) -> str:
        return f'{self.user} -> {self.item}'

    @staticmethod
    def subscribe(user: int, item: int) -> bool:
        ''' Add subscription. '''
        if Subscription.objects.filter(user_id=user, item_id=item).exists():
            return False
        Subscription.objects.create(user_id=user, item_id=item)
        return True

    @staticmethod
    def unsubscribe(user: int, item: int) -> bool:
        ''' Remove subscription. '''
        sub = Subscription.objects.filter(user_id=user, item_id=item).only('pk')
        if not sub.exists():
            return False
        sub.delete()
        return True
