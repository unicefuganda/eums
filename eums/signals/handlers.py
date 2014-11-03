from django.db.models.signals import post_save
from django.dispatch import receiver

from eums.models import DistributionPlanLineItem
from eums.services.flow_scheduler import schedule_run_for


@receiver(post_save, sender=DistributionPlanLineItem)
def on_post_save_line_item(sender, **kwargs):
    created = kwargs['created']
    update_fields = kwargs['update_fields']
    if True == created or update_fields is not None:
        print 'saving'
        line_item = kwargs['instance']
        schedule_run_for(line_item)
