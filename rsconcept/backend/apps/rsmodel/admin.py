''' Admin view: RSModel. '''
from django.contrib import admin

from shared.ExportCsvMixin import ExportCsvMixin

from . import models


@admin.register(models.ConstituentData)
class ConstituentDataAdmin(ExportCsvMixin, admin.ModelAdmin):
    ''' Admin model: ConstituentData. '''
    ordering = ['model']
    list_display = [
        'pk',
        'constituent__alias',
        'model',
        'type',
        'data']
    search_fields = ['id', 'model__title', 'model__alias']
    actions = ['export_as_csv']


@admin.register(models.RSModel)
class RSModelAdmin(ExportCsvMixin, admin.ModelAdmin):
    ''' Admin model: RSModel. '''
    ordering = ['model']
    list_display = ['pk', 'model', 'schema']
    search_fields = ['schema']
    actions = ['export_as_csv']
