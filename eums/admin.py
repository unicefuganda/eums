from django.contrib import admin

from eums.models import DistributionPlan, Programme, DistributionPlanNode, Item, \
    ItemUnit, Consignee, NodeRun, SalesOrder, SalesOrderItem, Option, TextAnswer, NumericAnswer, \
    MultipleChoiceAnswer, DistributionReport, PurchaseOrder, PurchaseOrderItem, ReleaseOrder, ReleaseOrderItem, Flow, \
    Question
from eums.models.question import NumericQuestion, TextQuestion, MultipleChoiceQuestion

admin.site.register(DistributionPlan)
admin.site.register(Programme)
admin.site.register(Item)
admin.site.register(ItemUnit)
admin.site.register(Consignee)
admin.site.register(DistributionPlanNode)
admin.site.register(SalesOrder)
admin.site.register(SalesOrderItem)
admin.site.register(PurchaseOrder)
admin.site.register(PurchaseOrderItem)
admin.site.register(ReleaseOrder)
admin.site.register(ReleaseOrderItem)
admin.site.register(NodeRun)
admin.site.register(MultipleChoiceQuestion)
admin.site.register(NumericQuestion)
admin.site.register(TextQuestion)
admin.site.register(Option)
admin.site.register(TextAnswer)
admin.site.register(NumericAnswer)
admin.site.register(MultipleChoiceAnswer)
admin.site.register(DistributionReport)
admin.site.register(Flow)
admin.site.register(Question)