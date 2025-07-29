''' Admin view: RSForms for conceptual schemas. '''
from django.contrib import admin

from . import models


@admin.register(models.Constituenta)
class ConstituentaAdmin(admin.ModelAdmin):
    ''' Admin model: Constituenta. '''
    ordering = ['schema', 'order']
    list_display = ['schema', 'order', 'alias', 'term_resolved', 'definition_resolved', 'crucial']
    search_fields = ['term_resolved', 'definition_resolved']
