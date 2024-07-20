# Generated by Django 5.0.7 on 2024-07-17 09:51

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('rsform', '0007_location_and_flags'),
    ]

    operations = [
        migrations.AlterField(
            model_name='libraryitem',
            name='item_type',
            field=models.CharField(choices=[('rsform', 'Rsform'), ('oss', 'Operation Schema')], max_length=50, verbose_name='Тип'),
        ),
    ]