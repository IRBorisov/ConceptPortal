''' Admin view: OperationSchema. '''
from django.contrib import admin

from . import models


@admin.register(models.Operation)
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
        'parent']
    search_fields = ['id', 'operation_type', 'title', 'alias']


@admin.register(models.Block)
class BlockAdmin(admin.ModelAdmin):
    ''' Admin model: Block. '''
    ordering = ['oss']
    list_display = ['id', 'oss', 'title', 'description', 'parent']
    search_fields = ['oss']


@admin.register(models.Layout)
class LayoutAdmin(admin.ModelAdmin):
    ''' Admin model: Layout. '''
    ordering = ['oss']
    list_display = ['id', 'oss', 'data']
    search_fields = ['oss']


@admin.register(models.Argument)
class ArgumentAdmin(admin.ModelAdmin):
    ''' Admin model: Operation arguments. '''
    ordering = ['operation']
    list_display = ['id', 'order', 'operation', 'argument']
    search_fields = ['id', 'operation', 'argument']


@admin.register(models.Substitution)
class SynthesisSubstitutionAdmin(admin.ModelAdmin):
    ''' Admin model:  Substitutions as part of Synthesis operation. '''
    ordering = ['operation']
    list_display = ['id', 'operation', 'original', 'substitution']
    search_fields = ['id', 'operation', 'original', 'substitution']


@admin.register(models.Inheritance)
class InheritanceAdmin(admin.ModelAdmin):
    ''' Admin model: Inheritance. '''
    ordering = ['operation']
    list_display = ['id', 'operation', 'parent', 'child']
    search_fields = ['id', 'operation', 'parent', 'child']


@admin.register(models.Reference)
class ReferenceAdmin(admin.ModelAdmin):
    ''' Admin model: Reference. '''
    ordering = ['reference', 'target']
    list_display = ['id', 'reference', 'target']
    search_fields = ['id', 'reference', 'target']
