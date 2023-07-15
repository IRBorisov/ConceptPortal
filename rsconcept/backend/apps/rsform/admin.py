from django.contrib import admin

from . import models


class ConstituentaAdmin(admin.ModelAdmin):
    pass


class RSFormAdmin(admin.ModelAdmin):
    pass


admin.site.register(models.Constituenta, ConstituentaAdmin)
admin.site.register(models.RSForm, RSFormAdmin)
