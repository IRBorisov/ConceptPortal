''' Admin view: Library. '''
from django.contrib import admin

from . import models


class LibraryItemAdmin(admin.ModelAdmin):
    ''' Admin model: LibraryItem. '''
    date_hierarchy = 'time_update'
    list_display = [
        'alias', 'title', 'owner',
        'visible', 'read_only', 'access_policy', 'location',
        'time_update'
    ]
    list_filter = ['visible', 'read_only', 'access_policy', 'location', 'time_update']
    search_fields = ['alias', 'title', 'location']


class LibraryTemplateAdmin(admin.ModelAdmin):
    ''' Admin model: LibraryTemplate. '''
    list_display = ['id', 'alias']
    list_select_related = ['lib_source']

    def alias(self, template: models.LibraryTemplate):
        if template.lib_source:
            return template.lib_source.alias
        else:
            return 'N/A'


class EditorAdmin(admin.ModelAdmin):
    ''' Admin model: Editors. '''
    list_display = ['id', 'item', 'editor']
    search_fields = [
        'item__title', 'item__alias',
        'editor__username', 'editor__first_name', 'editor__last_name'
    ]


class VersionAdmin(admin.ModelAdmin):
    ''' Admin model: Versions. '''
    list_display = ['id', 'item', 'version', 'description', 'time_create']
    search_fields = [
        'item__title', 'item__alias'
    ]



admin.site.register(models.LibraryItem, LibraryItemAdmin)
admin.site.register(models.LibraryTemplate, LibraryTemplateAdmin)
admin.site.register(models.Version, VersionAdmin)
admin.site.register(models.Editor, EditorAdmin)
