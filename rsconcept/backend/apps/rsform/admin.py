''' Admin view: RSForms for conceptual schemas. '''
from django.contrib import admin

from . import models


class ConstituentaAdmin(admin.ModelAdmin):
    ''' Admin model: Constituenta. '''
    ordering = ['schema', 'order']
    list_display = ['schema', 'order', 'alias', 'term_resolved', 'definition_resolved']
    search_fields = ['term_resolved', 'definition_resolved']


admin.site.register(models.Constituenta, ConstituentaAdmin)
