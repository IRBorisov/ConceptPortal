# Generated by Django 5.0.7 on 2024-07-30 07:36

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('oss', '0003_remove_operation_sync_text'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='substitution',
            name='transfer_term',
        ),
    ]
