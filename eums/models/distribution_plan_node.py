from django.db import models

from eums.models import DistributionPlan, Runnable


class DistributionPlanNode(Runnable):
    parent = models.ForeignKey('self', null=True, blank=True, related_name='children')
    distribution_plan = models.ForeignKey(DistributionPlan)
    item = models.ForeignKey('OrderItem')
    targeted_quantity = models.IntegerField()
    tree_position = models.CharField(max_length=255,
                                     choices=((Runnable.MIDDLE_MAN, 'Middleman'), (Runnable.END_USER, 'End User'),
                                              (Runnable.IMPLEMENTING_PARTNER, 'Implementing Partner')))

    def __unicode__(self):
        return "%s %s %s %s" % (self.consignee.name, self.tree_position, str(self.distribution_plan), self.item)

    def get_ip(self):
        if not self.parent:
            return {'id': self.id, 'location': self.location}
        else:
            return self.parent.get_ip()

    def sender_name(self):
        if not self.parent:
            return "UNICEF"
        else:
            return self.parent.consignee.name

    def description(self):
        return self.item.item.description
