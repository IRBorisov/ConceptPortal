"""Remove publication as a separate key permission."""
from django.db import migrations, models

from apps.agents.models.ApiKey import default_key_scopes


def remove_publish_scope(apps, schema_editor):
    keys = apps.get_model('agents', 'ApiKey').objects.using(schema_editor.connection.alias)
    for key in keys.only('scopes').order_by('pk').iterator():
        if isinstance(key.scopes, list) and 'publish' in key.scopes:
            key.scopes = [scope for scope in key.scopes if scope != 'publish']
            key.save(update_fields=['scopes'])


class Migration(migrations.Migration):
    dependencies = [('agents', '0004_apikey_scopes_and_expiry')]
    operations = [
        migrations.AlterField(
            model_name='apikey', name='scopes',
            field=models.JSONField(default=default_key_scopes),
        ),
        migrations.RunPython(remove_publish_scope, migrations.RunPython.noop),
    ]
