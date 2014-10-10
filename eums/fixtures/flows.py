from eums.models import Flow, DistributionPlanNode as Node


def seed_flows():
    Flow.objects.get_or_create(rapid_pro_id=2436, for_node_type=Node.END_USER)
    Flow.objects.get_or_create(rapid_pro_id=2662, for_node_type=Node.MIDDLE_MAN)