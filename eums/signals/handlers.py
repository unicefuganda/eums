from django.db.models.signals import post_save
from django.dispatch import receiver

from eums.models import DistributionPlanLineItem
from eums.services.flow_scheduler import schedule_run_for


@receiver(post_save, sender=DistributionPlanLineItem)
def on_post_save_line_item(sender, **kwargs):
    created = kwargs['created']
    line_item = kwargs['instance']
    if created and line_item.track:
        schedule_run_for(line_item)
