''' Admin view: OperationSchema. '''
from django.contrib import admin

from shared.ExportCsvMixin import ExportCsvMixin

from . import models


@admin.register(models.Operation)
class OperationAdmin(ExportCsvMixin, admin.ModelAdmin):
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
    actions = ['export_as_csv']


@admin.register(models.Block)
class BlockAdmin(ExportCsvMixin, admin.ModelAdmin):
    ''' Admin model: Block. '''
    ordering = ['oss']
    list_display = ['id', 'oss', 'title', 'description', 'parent']
    search_fields = ['oss']
    actions = ['export_as_csv']


@admin.register(models.Layout)
class LayoutAdmin(ExportCsvMixin, admin.ModelAdmin):
    ''' Admin model: Layout. '''
    ordering = ['oss']
    list_display = ['id', 'oss', 'data']
    search_fields = ['oss']
    actions = ['export_as_csv']


@admin.register(models.Argument)
class ArgumentAdmin(ExportCsvMixin, admin.ModelAdmin):
    ''' Admin model: Operation arguments. '''
    ordering = ['operation']
    list_display = ['id', 'order', 'operation', 'argument']
    search_fields = ['id', 'operation', 'argument']
    actions = ['export_as_csv']


@admin.register(models.Substitution)
class SynthesisSubstitutionAdmin(ExportCsvMixin, admin.ModelAdmin):
    ''' Admin model:  Substitutions as part of Synthesis operation. '''
    ordering = ['operation']
    list_display = ['id', 'operation', 'original', 'substitution']
    search_fields = ['id', 'operation', 'original', 'substitution']
    actions = ['export_as_csv']


@admin.register(models.Inheritance)
class InheritanceAdmin(ExportCsvMixin, admin.ModelAdmin):
    ''' Admin model: Inheritance. '''
    ordering = ['operation']
    list_display = ['id', 'operation', 'parent', 'child']
    search_fields = ['id', 'operation', 'parent', 'child']
    actions = ['export_as_csv']


@admin.register(models.Replica)
class ReplicaAdmin(ExportCsvMixin, admin.ModelAdmin):
    ''' Admin model: Replica. '''
    ordering = ['replica', 'original']
    list_display = ['id', 'replica', 'original']
    search_fields = ['id', 'replica', 'original']
    actions = ['export_as_csv']
