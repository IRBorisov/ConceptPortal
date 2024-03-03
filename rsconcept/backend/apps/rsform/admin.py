''' Admin view: RSForms for conceptual schemas. '''
from django.contrib import admin

from . import models


class ConstituentaAdmin(admin.ModelAdmin):
    ''' Admin model: Constituenta. '''
    ordering = ['schema', 'order']
    list_display = ['schema', 'alias', 'term_resolved', 'definition_resolved']
    search_fields = ['term_resolved', 'definition_resolved']


class LibraryItemAdmin(admin.ModelAdmin):
    ''' Admin model: LibraryItem. '''
    date_hierarchy = 'time_update'
    list_display = [
        'alias', 'title', 'owner',
        'is_common', 'is_canonical',
        'time_update'
    ]
    list_filter = ['is_common', 'is_canonical', 'time_update']
    search_fields = ['alias', 'title']


class LibraryTemplateAdmin(admin.ModelAdmin):
    ''' Admin model: LibraryTemplate. '''
    list_display = ['id', 'alias']
    list_select_related = ['lib_source']

    def alias(self, template: models.LibraryTemplate):
        if template.lib_source:
            return template.lib_source.alias
        else:
            return 'N/A'


class SubscriptionAdmin(admin.ModelAdmin):
    ''' Admin model: Subscriptions. '''
    list_display = ['id', 'item', 'user']
    search_fields = [
        'item__title', 'item__alias',
        'user__username', 'user__first_name', 'user__last_name'
    ]


class VersionAdmin(admin.ModelAdmin):
    ''' Admin model: Versions. '''
    list_display = ['id', 'item', 'version', 'description', 'time_create']
    search_fields = [
        'item__title', 'item__alias'
    ]


admin.site.register(models.Constituenta, ConstituentaAdmin)
admin.site.register(models.LibraryItem, LibraryItemAdmin)
admin.site.register(models.LibraryTemplate, LibraryTemplateAdmin)
admin.site.register(models.Subscription, SubscriptionAdmin)
admin.site.register(models.Version, VersionAdmin)
