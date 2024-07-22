''' Admin view: OperationSchema. '''
from django.contrib import admin

from . import models


class OperationAdmin(admin.ModelAdmin):
    ''' Admin model: Operation. '''
    ordering = ['oss']
    list_display = ['id', 'oss', 'operation_type', 'result', 'alias', 'title', 'comment', 'position_x', 'position_y']
    search_fields = ['id', 'operation_type', 'title', 'alias']


class ArgumentAdmin(admin.ModelAdmin):
    ''' Admin model: Operation arguments. '''
    ordering = ['operation']
    list_display = ['id', 'operation', 'argument']
    search_fields = ['id', 'operation', 'argument']


class SynthesisSubstitutionAdmin(admin.ModelAdmin):
    ''' Admin model:  Substitutions as part of Synthesis operation. '''
    ordering = ['operation']
    list_display = ['id', 'operation', 'original', 'substitution', 'transfer_term']
    search_fields = ['id', 'operation', 'original', 'substitution']


admin.site.register(models.Operation, OperationAdmin)
admin.site.register(models.Argument, ArgumentAdmin)
admin.site.register(models.SynthesisSubstitution, SynthesisSubstitutionAdmin)
