''' Admin view: Library. '''
from typing import cast

from django.contrib import admin

from shared.ExportCsvMixin import ExportCsvMixin

from . import models


@admin.register(models.LibraryItem)
class LibraryItemAdmin(ExportCsvMixin, admin.ModelAdmin):
    ''' Admin model: LibraryItem. '''
    date_hierarchy = 'time_update'
    list_display = [
        'alias', 'title', 'owner',
        'visible', 'read_only', 'access_policy', 'location',
        'time_update'
    ]
    list_filter = ['visible', 'read_only', 'access_policy', 'location', 'time_update']
    search_fields = ['alias', 'title', 'location']
    actions = ['export_as_csv']


@admin.register(models.LibraryTemplate)
class LibraryTemplateAdmin(admin.ModelAdmin):
    ''' Admin model: LibraryTemplate. '''
    list_display = ['id', 'alias']
    list_select_related = ['lib_source']

    def alias(self, template: models.LibraryTemplate):
        if template.lib_source:
            return cast(models.LibraryItem, template.lib_source).alias
        else:
            return 'N/A'


@admin.register(models.Editor)
class EditorAdmin(ExportCsvMixin, admin.ModelAdmin):
    ''' Admin model: Editors. '''
    list_display = ['id', 'item', 'editor']
    search_fields = [
        'item__title', 'item__alias',
        'editor__username', 'editor__first_name', 'editor__last_name'
    ]
    actions = ['export_as_csv']


@admin.register(models.Version)
class VersionAdmin(admin.ModelAdmin):
    ''' Admin model: Versions. '''
    list_display = ['id', 'item', 'version', 'description', 'time_create']
    search_fields = [
        'item__title', 'item__alias'
    ]
