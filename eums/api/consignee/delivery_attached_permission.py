from eums.models import DistributionPlanNode
from rest_framework import permissions


class DeliveryAttachedPermission(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method == 'PUT':
            if len(DistributionPlanNode.objects.filter(consignee=obj.id)) > 0:
                return obj.has_only_dirty_remarks(request.data)
        elif request.method == 'DELETE':
            return len(DistributionPlanNode.objects.filter(consignee=obj.id)) == 0

        return True