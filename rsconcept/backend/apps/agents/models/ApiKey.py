''' Model: user-issued API key for /api/agents routes. '''
from __future__ import annotations

import hashlib
import secrets

from django.db import models
from django.utils import timezone

from apps.users.models import User

KEY_PREFIX = 'rcp_'
PUBLIC_PREFIX_LENGTH = 8
SECRET_LENGTH = 32


def generate_api_key_token() -> tuple[str, str, str]:
    ''' Return (plaintext, public_prefix, sha256_hex). '''
    public_prefix = secrets.token_urlsafe(PUBLIC_PREFIX_LENGTH)[:PUBLIC_PREFIX_LENGTH]
    secret = secrets.token_urlsafe(SECRET_LENGTH)
    plaintext = f'{KEY_PREFIX}{public_prefix}_{secret}'
    return plaintext, public_prefix, hash_api_key(plaintext)


def hash_api_key(plaintext: str) -> str:
    ''' Hash full API key token for storage. '''
    return hashlib.sha256(plaintext.encode('utf-8')).hexdigest()


class ApiKey(models.Model):
    ''' Persistent API key owned by a user. Secret is stored hashed only. '''
    owner = models.ForeignKey(
        verbose_name='Владелец',
        to=User,
        on_delete=models.CASCADE,
        related_name='api_keys'
    )
    label = models.CharField(
        verbose_name='Название',
        max_length=100
    )
    prefix = models.CharField(
        verbose_name='Префикс',
        max_length=16,
        db_index=True
    )
    key_hash = models.CharField(
        verbose_name='Хэш ключа',
        max_length=64,
        unique=True
    )
    created_at = models.DateTimeField(
        verbose_name='Создан',
        auto_now_add=True
    )
    last_used_at = models.DateTimeField(
        verbose_name='Последнее использование',
        null=True,
        blank=True
    )
    revoked_at = models.DateTimeField(
        verbose_name='Отозван',
        null=True,
        blank=True
    )

    class Meta:
        verbose_name = 'API-ключ'
        verbose_name_plural = 'API-ключи'
        ordering = ['-created_at']

    def __str__(self) -> str:
        return f'{self.label} ({self.prefix})'

    @property
    def is_active(self) -> bool:
        return self.revoked_at is None

    def revoke(self) -> None:
        if self.revoked_at is None:
            self.revoked_at = timezone.now()
            self.save(update_fields=['revoked_at'])

    def touch_last_used(self) -> None:
        self.last_used_at = timezone.now()
        self.save(update_fields=['last_used_at'])

    @classmethod
    def create_for_user(cls, owner: User, label: str) -> tuple['ApiKey', str]:
        ''' Create key and return (model, plaintext once). '''
        plaintext, prefix, key_hash = generate_api_key_token()
        key = cls.objects.create(
            owner=owner,
            label=label,
            prefix=prefix,
            key_hash=key_hash
        )
        return key, plaintext

    @classmethod
    def authenticate_token(cls, plaintext: str) -> ApiKey | None:
        ''' Resolve active key by plaintext token. '''
        if not plaintext or not plaintext.startswith(KEY_PREFIX):
            return None
        key_hash = hash_api_key(plaintext)
        try:
            key = cls.objects.select_related('owner').get(key_hash=key_hash)
        except cls.DoesNotExist:
            return None
        if not key.is_active:
            return None
        return key
