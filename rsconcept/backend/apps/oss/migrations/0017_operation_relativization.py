import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('oss', '0016_alter_operation_operation_type_replica_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='operation',
            name='operation_type',
            field=models.CharField(
                choices=[
                    ('input', 'Input'),
                    ('synthesis', 'Synthesis'),
                    ('relativization', 'Relativization'),
                    ('replica', 'Replica'),
                ],
                default='input',
                max_length=14,
                verbose_name='Тип',
            ),
        ),
        migrations.AddField(
            model_name='operation',
            name='relativization_source',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='+',
                to='library.libraryitem',
                verbose_name='Исходная КС релятивизации',
            ),
        ),
        migrations.AddField(
            model_name='operation',
            name='relativization',
            field=models.JSONField(blank=True, null=True, verbose_name='Параметры релятивизации'),
        ),
    ]
