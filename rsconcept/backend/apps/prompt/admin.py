''' Admin view: Prompts for AI helper. '''
from django.contrib import admin

from . import models


@admin.register(models.PromptTemplate)
class PromptTemplateAdmin(admin.ModelAdmin):
    ''' Admin model: PromptTemplate. '''
    list_display = ('id', 'label', 'owner', 'is_shared')
    list_filter = ('is_shared', 'owner')
    search_fields = ('label', 'description', 'text')
