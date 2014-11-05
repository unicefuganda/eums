from django.conf import settings
from django.db import models
import requests

from eums.models import DistributionPlan, Consignee


class DistributionPlanNode(models.Model):
    IMPLEMENTING_PARTNER = 'IMPLEMENTING_PARTNER'
    MIDDLE_MAN = 'MIDDLE_MAN'
    END_USER = 'END_USER'
    DIRECT_DELIVERY = 'DIRECT_DELIVERY'
    THROUGH_WAREHOUSE = 'WAREHOUSE'

    parent = models.ForeignKey('self', null=True, blank=True, related_name='children')
    distribution_plan = models.ForeignKey(DistributionPlan)
    location = models.CharField(max_length=255)
    mode_of_delivery = models.CharField(max_length=255, choices=(
        (DIRECT_DELIVERY, "Direct Delivery"), (THROUGH_WAREHOUSE, 'Warehouse')))
    consignee = models.ForeignKey(Consignee)
    contact_person_id = models.CharField(max_length=255)
    tree_position = models.CharField(max_length=255, choices=((MIDDLE_MAN, 'Middleman'), (END_USER, 'End User'),
                                                              (IMPLEMENTING_PARTNER, 'Implementing Partner')))

    def build_contact(self):
        response = requests.get("%s%s/" % (settings.CONTACTS_SERVICE_URL, self.contact_person_id))
        result = response.json() if response.status_code is 200 else None
        return result

    def __unicode__(self):
        return "%s %s %s " % (self.consignee.name, self.tree_position, str(self.distribution_plan))

    def responses(self):
        all_line_items = self.distributionplanlineitem_set.all()
        completed_line_item_runs = filter(None, map(lambda line_item: line_item.completed_run(), all_line_items))
        return dict(map(lambda run: (run, run.answers()), completed_line_item_runs))