from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('rsform', '0006_attribution_delete_association'),
    ]

    operations = [
        migrations.AddField(
            model_name='constituenta',
            name='typification_manual',
            field=models.TextField(blank=True, default='', verbose_name='Ручная типизация'),
        ),
    ]
