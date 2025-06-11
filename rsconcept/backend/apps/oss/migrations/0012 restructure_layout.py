from django.db import migrations


def migrate_layout(apps, schema_editor):
    Layout = apps.get_model('oss', 'Layout')

    for layout in Layout.objects.all():
        previous_data = layout.data
        new_layout = []

        for operation in previous_data['operations']:
            new_layout.append({
                'nodeID': 'o' + str(operation['id']),
                'x': operation['x'],
                'y': operation['y'],
                'width': 150,
                'height': 40
            })

        for block in previous_data['blocks']:
            new_layout.append({
                'nodeID': 'b' + str(block['id']),
                'x': block['x'],
                'y': block['y'],
                'width': block['width'],
                'height': block['height']
            })

        layout.data = new_layout
        layout.save(update_fields=['data'])


class Migration(migrations.Migration):

    dependencies = [
        ('oss', '0011_remove_operation_position_x_and_more'),
    ]

    operations = [
        migrations.RunPython(migrate_layout),
    ]
