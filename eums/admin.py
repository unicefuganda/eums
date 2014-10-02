from django.contrib import admin

from eums.models import DistributionPlan, Programme, DistributionPlanNode, DistributionPlanLineItem, Item, \
    ItemUnit, Consignee, NodeRun, SalesOrder, SalesOrderItem

admin.site.register(DistributionPlan)
admin.site.register(Programme)
admin.site.register(Item)
admin.site.register(ItemUnit)
admin.site.register(Consignee)
admin.site.register(DistributionPlanNode)
admin.site.register(DistributionPlanLineItem)
admin.site.register(SalesOrder)
admin.site.register(SalesOrderItem)
admin.site.register(NodeRun)
admin.site.register(SalesOrder)
