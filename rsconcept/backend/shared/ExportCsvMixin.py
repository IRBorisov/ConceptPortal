''' Utils: Admin mixin for exporting as CSV. '''
import csv

from django.http import HttpResponse


class ExportCsvMixin:
    ''' Export as CSV mixin. '''
    export_csv_filename = 'export.csv'
    export_csv_fields = None   # None ⇒ use list_display

    def export_as_csv(self, request, queryset):
        """
        Generic CSV export using either:
         - export_csv_fields
         - or list_display if not set
        """
        fields = self.export_csv_fields or self.list_display

        response = HttpResponse(content_type='text/csv')
        response["Content-Disposition"] = (
            f'attachment; filename="{self.export_csv_filename}"'
        )

        writer = csv.writer(response)
        writer.writerow(fields)

        for obj in queryset:
            row = []
            for field in fields:
                value = getattr(obj, field)
                # Call functions if list_display contains callables
                if callable(value):
                    value = value()
                row.append(value)
            writer.writerow(row)

        return response

    export_as_csv.short_description = 'Выгрузить выделенные в CSV'  # type: ignore[attr-defined]
