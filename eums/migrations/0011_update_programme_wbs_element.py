# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations


def back_fill_programme_wbs_elements(apps, schema_editor):
    Programme = apps.get_model("eums", "Programme")

    programmes = {'YI107 - PCR 3 KEEP CHILDREN SAFE': '4380/A0/04/107',
                  'YI105 - PCR 1 KEEP CHILDREN AND MOTHERS': '4380/A0/04/105',
                  'Y108 - PCR 4 CROSS SECTORAL': '4380/A0/04/108',
                  'YP109 - PCR 5 SUPPORT': '4380/A0/04/800',
                  'YI106 - PCR 2 KEEP CHILDREN LEARNING': '4380/A0/04/106',
                  'YI101 KEEP CHILDREN AND MOTHERS ALIVE': '4380/A0/04/101',
                  'YP104 MANAGEMENT RESULTS': '4380/A0/04/104',
                  'YI102 KEEP CHILDREN LEARNING': '4380/A0/04/102',
                  'YI103 KEEP CHILDREN SAFE': '4380/A0/04/103',
                  '* YP109 - PCR 5 Support - Effective & efficient programme ma': '4380/A0/04/109',
                  '* 040623/YW402-YW402 Water, Sanitation and': '4380/A0/04/402',
                  '* 040623/YP602-YP602 Cross-Sectoral Costs': '4380/A0/04/602'}

    for programme in Programme.objects.all():
        if programme.name in programmes.keys():
            programme.wbs_element_ex = programmes[programme.name]
            programme.save()


class Migration(migrations.Migration):
    dependencies = [
        ('eums', '0010_programme_wbs_element_ex'),
    ]

    operations = [
        migrations.RunPython(back_fill_programme_wbs_elements)

    ]