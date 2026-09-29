''' Admin: Agents. '''
from django.contrib import admin

from .models import AgentActionLog, ApiKey


@admin.register(ApiKey)
class ApiKeyAdmin(admin.ModelAdmin):
    ''' API keys. The secret hash is visible to staff, never the plaintext. '''
    list_display = ('id', 'label', 'prefix', 'owner', 'created_at', 'last_used_at', 'revoked_at')
    list_filter = ('revoked_at',)
    search_fields = ('label', 'prefix', 'owner__username')
    readonly_fields = ('prefix', 'key_hash', 'created_at', 'last_used_at', 'revoked_at')


@admin.register(AgentActionLog)
class AgentActionLogAdmin(admin.ModelAdmin):
    ''' Agent action log. Rows are written by the API and not edited here. '''
    list_display = (
        'id', 'action', 'user', 'key_prefix', 'item_id', 'item_alias',
        'status_code', 'created_at',
    )
    list_filter = ('action', 'status_code')
    search_fields = ('summary', 'item_alias', 'key_label', 'user__username')
    readonly_fields = (
        'user', 'api_key', 'key_label', 'key_prefix', 'action',
        'item_id', 'item_alias', 'item_title', 'status_code', 'summary',
        'request_text', 'created_at',
    )
