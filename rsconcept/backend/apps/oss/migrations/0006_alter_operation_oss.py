# Generated by Django 5.0.7 on 2024-08-09 13:56

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('library', '0003_alter_librarytemplate_lib_source'),
        ('oss', '0005_inheritance_operation'),
    ]

    operations = [
        migrations.AlterField(
            model_name='operation',
            name='oss',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='operations', to='library.libraryitem', verbose_name='Схема синтеза'),
        ),
    ]
