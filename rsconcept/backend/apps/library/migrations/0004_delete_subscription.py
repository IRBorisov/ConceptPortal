# Generated by Django 5.1 on 2024-08-20 11:42

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('library', '0003_alter_librarytemplate_lib_source'),
    ]

    operations = [
        migrations.DeleteModel(
            name='Subscription',
        ),
    ]
