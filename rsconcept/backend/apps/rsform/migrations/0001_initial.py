# Generated by Django 4.2.3 on 2023-07-26 15:19

import apps.rsform.models
from django.conf import settings
import django.core.validators
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='RSForm',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.TextField(verbose_name='Название')),
                ('alias', models.CharField(blank=True, max_length=255, verbose_name='Шифр')),
                ('comment', models.TextField(blank=True, verbose_name='Комментарий')),
                ('is_common', models.BooleanField(default=False, verbose_name='Общая')),
                ('time_create', models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')),
                ('time_update', models.DateTimeField(auto_now=True, verbose_name='Дата изменения')),
                ('owner', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL, verbose_name='Владелец')),
            ],
            options={
                'verbose_name': 'Схема',
                'verbose_name_plural': 'Схемы',
            },
        ),
        migrations.CreateModel(
            name='Constituenta',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('order', models.PositiveIntegerField(default=-1, validators=[django.core.validators.MinValueValidator(1)], verbose_name='Позиция')),
                ('alias', models.CharField(default='undefined', max_length=8, verbose_name='Имя')),
                ('cst_type', models.CharField(choices=[('basic', 'Base'), ('constant', 'Constant'), ('structure', 'Structured'), ('axiom', 'Axiom'), ('term', 'Term'), ('function', 'Function'), ('predicate', 'Predicate'), ('theorem', 'Theorem')], default='basic', max_length=10, verbose_name='Тип')),
                ('convention', models.TextField(blank=True, default='', verbose_name='Комментарий/Конвенция')),
                ('term_raw', models.TextField(blank=True, default='', verbose_name='Термин (с отсылками)')),
                ('term_resolved', models.TextField(blank=True, default='', verbose_name='Термин')),
                ('term_forms', models.JSONField(default=apps.rsform.models._empty_forms, verbose_name='Словоформы')),
                ('definition_formal', models.TextField(blank=True, default='', verbose_name='Родоструктурное определение')),
                ('definition_raw', models.TextField(blank=True, default='', verbose_name='Текстовое определние (с отсылками)')),
                ('definition_resolved', models.TextField(blank=True, default='', verbose_name='Текстовое определние')),
                ('schema', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='rsform.rsform', verbose_name='Концептуальная схема')),
            ],
            options={
                'verbose_name': 'Конституета',
                'verbose_name_plural': 'Конституенты',
            },
        ),
    ]
