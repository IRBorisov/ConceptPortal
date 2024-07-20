''' Admin view: OperationSchema. '''
from django.contrib import admin

from . import models


class OperationAdmin(admin.ModelAdmin):
    ''' Admin model: Operation. '''
    ordering = ['oss']
    list_display = ['oss', 'operation_type', 'result', 'alias', 'title', 'comment', 'position_x', 'position_y']
    search_fields = ['operation_type', 'title', 'alias']


admin.site.register(models.Operation, OperationAdmin)
