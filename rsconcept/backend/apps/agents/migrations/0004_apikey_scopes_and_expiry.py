"""Add opt-in scopes and expiration without revoking existing keys."""
from apps.agents.models.ApiKey import default_api_key_scopes
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [('agents', '0003_agentlog_request_and_cleanup')]
    operations = [
        migrations.AddField(
            model_name='apikey', name='scopes',
            field=models.JSONField(default=default_api_key_scopes),
        ),
        migrations.AddField(
            model_name='apikey', name='expires_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
