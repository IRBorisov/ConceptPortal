from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('library', '0009_alter_libraryitem_options'),
    ]

    operations = [
        migrations.AlterField(
            model_name='libraryitem',
            name='time_update',
            field=models.DateTimeField(verbose_name='Дата изменения'),
        ),
    ]
