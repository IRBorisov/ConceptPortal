from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('rsform', '0007_constituenta_typification_manual'),
    ]

    operations = [
        migrations.AddField(
            model_name='constituenta',
            name='value_is_property',
            field=models.BooleanField(default=False, verbose_name='Ручной класс значения (свойство)'),
        ),
    ]

