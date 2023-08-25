''' Admin view: RSForms for conceptual schemas. '''
from django.contrib import admin

from . import models


class ConstituentaAdmin(admin.ModelAdmin):
    ''' Admin model: Constituenta. '''


class Librarydmin(admin.ModelAdmin):
    ''' Admin model: LibraryItem. '''


admin.site.register(models.Constituenta, ConstituentaAdmin)
admin.site.register(models.LibraryItem, Librarydmin)
