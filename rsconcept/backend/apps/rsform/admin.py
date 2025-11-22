''' Admin view: RSForms for conceptual schemas. '''
from django.contrib import admin

from shared.ExportCsvMixin import ExportCsvMixin

from . import models


@admin.register(models.Constituenta)
class ConstituentaAdmin(ExportCsvMixin, admin.ModelAdmin):
    ''' Admin model: Constituenta. '''
    ordering = ['schema', 'order']
    list_display = ['schema', 'order', 'alias', 'term_resolved', 'definition_resolved', 'crucial']
    search_fields = ['term_resolved', 'definition_resolved']
    actions = ['export_as_csv']


@admin.register(models.Attribution)
class AttributionAdmin(ExportCsvMixin, admin.ModelAdmin):
    ''' Admin model: Attribution. '''
    ordering = ['container__schema', 'container', 'attribute']
    list_display = ['container__schema__alias', 'container__alias', 'attribute__alias']
    search_fields = ['container', 'attribute']
    actions = ['export_as_csv']
