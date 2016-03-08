from django.contrib.contenttypes.models import ContentType
from django.db.models import Q

from eums.models import Alert, DistributionPlanNode, DistributionPlan


def get_queryset(alert_type=None, po_waybill=None):
    return __get_alerts_by_type(alert_type, __filter_po_waybill(po_waybill))


def __filter_po_waybill(po_waybill):
    if po_waybill:
        return Alert.objects.filter(order_number__icontains=po_waybill)

    return Alert.objects.all()


def __get_alerts_by_type(alert_type, queryset):
    types = {
        Alert.ITEM: queryset.filter(
            runnable__polymorphic_ctype=ContentType.objects.get_for_model(DistributionPlanNode)),

        Alert.DELIVERY: queryset.filter(
            Q(runnable__polymorphic_ctype=ContentType.objects.get_for_model(DistributionPlan)),
            ~Q(issue=Alert.ISSUE_TYPES.distribution_expired)),

        Alert.DISTRIBUTION: queryset.filter(
            runnable__polymorphic_ctype=ContentType.objects.get_for_model(DistributionPlan),
            issue=Alert.ISSUE_TYPES.distribution_expired)
    }

    return types.get(alert_type, None)
