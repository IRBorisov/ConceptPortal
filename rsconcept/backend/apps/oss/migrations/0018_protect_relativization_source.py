import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('oss', '0017_operation_relativization'),
    ]

    operations = [
        migrations.AlterField(
            model_name='operation',
            name='relativization_source',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='+',
                to='library.libraryitem',
                verbose_name='Исходная КС релятивизации',
            ),
        ),
    ]
