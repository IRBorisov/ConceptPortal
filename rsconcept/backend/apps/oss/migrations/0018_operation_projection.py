from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [('oss', '0017_operation_relativization')]

    operations = [
        migrations.AddField(
            model_name='operation',
            name='projection',
            field=models.JSONField(blank=True, null=True, verbose_name='Соответствия конституент релятивизации'),
        ),
    ]
