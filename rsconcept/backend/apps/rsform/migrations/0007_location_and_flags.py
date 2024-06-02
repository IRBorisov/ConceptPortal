# Hand written migration 20240531

from django.db import migrations, models

from .. import models as m


class Migration(migrations.Migration):

    dependencies = [
        ('rsform', '0006_editor'),
    ]

    def calculate_location(apps, schema_editor):
        LibraryItem = apps.get_model('rsform', 'LibraryItem')
        db_alias = schema_editor.connection.alias
        for item in LibraryItem.objects.using(db_alias).all():
            if item.is_canonical:
                location = m.LocationHead.LIBRARY
            elif item.is_common:
                location = m.LocationHead.COMMON
            else:
                location = m.LocationHead.USER
            item.location = location
            item.save()

    operations = [
        migrations.AddField(
            model_name='libraryitem',
            name='access_policy',
            field=models.CharField(
                choices=[
                    ('public', 'Public'),
                    ('protected', 'Protected'),
                    ('private', 'Private')
                ],
                default='public',
                max_length=500,
                verbose_name='Политика доступа'),
        ),
        migrations.AddField(
            model_name='libraryitem',
            name='location',
            field=models.TextField(default='/U', max_length=500, verbose_name='Расположение'),
        ),
        migrations.AddField(
            model_name='libraryitem',
            name='read_only',
            field=models.BooleanField(default=False, verbose_name='Запретить редактирование'),
        ),
        migrations.AddField(
            model_name='libraryitem',
            name='visible',
            field=models.BooleanField(default=True, verbose_name='Отображаемая'),
        ),
        migrations.RunPython(calculate_location, migrations.RunPython.noop),  # type: ignore
        migrations.RemoveField(
            model_name='libraryitem',
            name='is_canonical',
        ),
        migrations.RemoveField(
            model_name='libraryitem',
            name='is_common',
        ),
    ]
