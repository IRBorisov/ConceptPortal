''' Admin view: RSForms for conceptual schemas. '''
from django.contrib import admin

from . import models


class ConstituentaAdmin(admin.ModelAdmin):
    ''' Admin model: Constituenta. '''
    ordering = ['schema', 'order']
    list_display = ['schema', 'alias', 'term_resolved', 'definition_resolved']
    search_fields = ['term_resolved', 'definition_resolved']

class LibraryAdmin(admin.ModelAdmin):
    ''' Admin model: LibraryItem. '''
    date_hierarchy = 'time_update'
    list_display = [
        'alias', 'title', 'owner',
        'is_common', 'is_canonical',
        'time_update'
    ]
    list_filter = ['is_common', 'is_canonical', 'time_update']
    search_fields = ['alias', 'title']


class SubscriptionAdmin(admin.ModelAdmin):
    ''' Admin model: Subscriptions. '''
    list_display = ['id', 'item', 'user']
    search_fields = [
        'item__title', 'item__alias',
        'user__username', 'user__first_name', 'user__last_name'
    ]


admin.site.register(models.Constituenta, ConstituentaAdmin)
admin.site.register(models.LibraryItem, LibraryAdmin)
admin.site.register(models.Subscription, SubscriptionAdmin)
