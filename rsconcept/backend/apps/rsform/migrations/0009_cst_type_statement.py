# Generated manually for theorem -> statement rename

from django.db import migrations, models


def migrate_theorem_to_statement(apps, schema_editor):
    Constituenta = apps.get_model('rsform', 'Constituenta')
    Constituenta.objects.filter(cst_type='theorem').update(cst_type='statement')

    Version = apps.get_model('library', 'Version')
    for version in Version.objects.all().iterator():
        data = version.data
        if not data or 'items' not in data:
            continue
        changed = False
        for item in data['items']:
            if item.get('cst_type') == 'theorem':
                item['cst_type'] = 'statement'
                changed = True
        if changed:
            version.save(update_fields=['data'])


def migrate_statement_to_theorem(apps, schema_editor):
    Constituenta = apps.get_model('rsform', 'Constituenta')
    Constituenta.objects.filter(cst_type='statement').update(cst_type='theorem')

    Version = apps.get_model('library', 'Version')
    for version in Version.objects.all().iterator():
        data = version.data
        if not data or 'items' not in data:
            continue
        changed = False
        for item in data['items']:
            if item.get('cst_type') == 'statement':
                item['cst_type'] = 'theorem'
                changed = True
        if changed:
            version.save(update_fields=['data'])


class Migration(migrations.Migration):

    dependencies = [
        ('library', '0009_alter_libraryitem_options'),
        ('rsform', '0008_constituenta_value_is_property'),
    ]

    operations = [
        migrations.RunPython(migrate_theorem_to_statement, migrate_statement_to_theorem),
        migrations.AlterField(
            model_name='constituenta',
            name='cst_type',
            field=models.CharField(
                choices=[
                    ('nominal', 'Nominal'),
                    ('basic', 'Base'),
                    ('constant', 'Constant'),
                    ('structure', 'Structured'),
                    ('axiom', 'Axiom'),
                    ('term', 'Term'),
                    ('function', 'Function'),
                    ('predicate', 'Predicate'),
                    ('statement', 'Statement'),
                ],
                default='basic',
                max_length=10,
                verbose_name='Тип',
            ),
        ),
    ]
