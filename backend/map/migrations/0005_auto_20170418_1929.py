# -*- coding: utf-8 -*-
# Generated by Django 1.10.6 on 2017-04-18 19:29
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('map', '0004_journey_method'),
    ]

    operations = [
        migrations.RenameField(
            model_name='journey',
            old_name='datetime',
            new_name='checkin',
        ),
    ]