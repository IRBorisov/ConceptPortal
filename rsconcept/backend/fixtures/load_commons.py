import os
from django.db import migrations

from apps.rsform import utils
from apps.rsform.models import RSForm
from apps.rsform.serializers import RSFormTRSSerializer
from apps.users.models import User


def load_initial_schemas(apps, schema_editor):
    rootdir = os.path.join(os.getcwd(), 'data')
    for subdir, dirs, files in os.walk(rootdir):
        for file in files:
            data = utils.read_zipped_json(os.path.join(subdir, file))
            data['is_common'] = True
            data['is_canonical'] = True
            serializer = RSFormTRSSerializer(data=data, context={'load_meta': True})
            serializer.is_valid(raise_exception=True)
            serializer.save()


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('rsform', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(load_initial_schemas),
    ]
