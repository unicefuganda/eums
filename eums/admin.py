from django.contrib import admin
from eums.models import SupplyPlan, DistributionPlan, Programme, DistributionPlanLineItem, Item, ItemUnit, Consignee

admin.site.register(SupplyPlan)
admin.site.register(DistributionPlan)
admin.site.register(Programme)
admin.site.register(DistributionPlanLineItem)
admin.site.register(Item)
admin.site.register(ItemUnit)
admin.site.register(Consignee)