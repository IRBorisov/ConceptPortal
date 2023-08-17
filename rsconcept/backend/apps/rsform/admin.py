''' Admin view: RSForms for conceptual schemas. '''
from django.contrib import admin

from . import models


class ConstituentaAdmin(admin.ModelAdmin):
    ''' Admin model: Constituenta. '''


class RSFormAdmin(admin.ModelAdmin):
    ''' Admin model: RSForm. '''


admin.site.register(models.Constituenta, ConstituentaAdmin)
admin.site.register(models.RSForm, RSFormAdmin)
