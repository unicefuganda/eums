from django.db.models.signals import post_save
from django.dispatch import receiver

from eums.models import DistributionPlanNode
from eums.services.flow_scheduler import schedule_run_for


@receiver(post_save, sender=DistributionPlanNode)
def on_post_save_line_item(sender, **kwargs):
    node = kwargs['instance']
    if node.track and node.latest_run() is None:
        schedule_run_for(node)

