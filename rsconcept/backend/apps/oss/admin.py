''' Admin view: OperationSchema. '''
from django.contrib import admin

from . import models


class OperationAdmin(admin.ModelAdmin):
    ''' Admin model: Operation. '''
    ordering = ['oss']
    list_display = [
        'id',
        'oss',
        'operation_type',
        'result',
        'alias',
        'title',
        'description',
        'position_x',
        'position_y']
    search_fields = ['id', 'operation_type', 'title', 'alias']


class ArgumentAdmin(admin.ModelAdmin):
    ''' Admin model: Operation arguments. '''
    ordering = ['operation']
    list_display = ['id', 'order', 'operation', 'argument']
    search_fields = ['id', 'operation', 'argument']


class SynthesisSubstitutionAdmin(admin.ModelAdmin):
    ''' Admin model:  Substitutions as part of Synthesis operation. '''
    ordering = ['operation']
    list_display = ['id', 'operation', 'original', 'substitution']
    search_fields = ['id', 'operation', 'original', 'substitution']


class InheritanceAdmin(admin.ModelAdmin):
    ''' Admin model: Inheritance. '''
    ordering = ['operation']
    list_display = ['id', 'operation', 'parent', 'child']
    search_fields = ['id', 'operation', 'parent', 'child']


admin.site.register(models.Operation, OperationAdmin)
admin.site.register(models.Argument, ArgumentAdmin)
admin.site.register(models.Substitution, SynthesisSubstitutionAdmin)
admin.site.register(models.Inheritance, InheritanceAdmin)
