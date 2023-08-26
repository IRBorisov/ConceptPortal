''' Admin view: RSForms for conceptual schemas. '''
from django.contrib import admin

from . import models


class ConstituentaAdmin(admin.ModelAdmin):
    ''' Admin model: Constituenta. '''


class LibraryAdmin(admin.ModelAdmin):
    ''' Admin model: LibraryItem. '''


class SubscriptionAdmin(admin.ModelAdmin):
    ''' Admin model: Subscriptions. '''


admin.site.register(models.Constituenta, ConstituentaAdmin)
admin.site.register(models.LibraryItem, LibraryAdmin)
admin.site.register(models.Subscription, SubscriptionAdmin)
