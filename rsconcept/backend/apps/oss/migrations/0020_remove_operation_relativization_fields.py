from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [('oss', '0019_relativization_models')]

    operations = [
        migrations.RemoveField(model_name='operation', name='projection'),
        migrations.RemoveField(model_name='operation', name='relativization_passport'),
        migrations.RemoveField(model_name='operation', name='relativization_source'),
    ]
