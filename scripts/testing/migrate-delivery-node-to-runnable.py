import json
from eums.models import DistributionPlanNode

f = open('nodes.json')
fixtures = json.load(f)


def create_node(object_dict):
    fields = object_dict['fields']
    DistributionPlanNode.objects.get_or_create(
        id=object_dict['pk'],
        parent_id=fields['parent'],
        distribution_plan_id=fields['distribution_plan'],
        item_id=fields['item'],
        targeted_quantity=fields['targeted_quantity'],
        tree_position=fields['tree_position'],
        location=fields['location'],
        contact_person_id=fields['contact_person_id'],
        track=fields['track'],
        delivery_date=fields['delivery_date'],
        remark=fields['remark'],
        consignee_id=fields['consignee']
    )

nodes = filter(lambda entry: entry['model'] == 'eums.distributionplannode', fixtures)
[create_node(node) for node in nodes]
print('******* Nodes in DB: ', DistributionPlanNode.objects.count())
