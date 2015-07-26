import json
from eums.models import DistributionPlan

f = open('plans.json')
plans = json.load(f)


def create_plan(object_dict):
    fields = object_dict['fields']
    DistributionPlan.objects.get_or_create(
        pk=object_dict['pk'],
        date=fields['date'],
        programme_id=fields['programme'],
        remark=fields['remark'],
        consignee_id=fields['consignee'],
        contact_person_id=fields['contact_person_id'],
        delivery_date=fields['delivery_date'],
        location=fields['location']
    )

[create_plan(plan) for plan in plans]
print '\n** %d plans in database' % DistributionPlan.objects.count()

