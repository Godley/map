# -*- coding: utf-8 -*-
# Generated by Django 1.10.6 on 2017-07-23 19:12
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('map', '0008_journey_route_name'),
    ]

    operations = [
        migrations.AddField(
            model_name='stay',
            name='link',
            field=models.URLField(default='https://airbnb.co.uk'),
        ),
    ]