from django.db.models.signals import post_save
from django.dispatch import receiver

from eums.models import DistributionPlanLineItem
from eums.services.flow_scheduler import schedule_run_for


@receiver(post_save, sender=DistributionPlanLineItem)
def on_post_save_line_item(sender, **kwargs):
    line_item = kwargs['instance']
    schedule_run_for(line_item)