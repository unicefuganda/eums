from eums.models import DistributionPlan
from rest_framework import permissions


class DeliveryAttachedPermission(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method == 'PUT':
            if len(DistributionPlan.objects.filter(consignee=obj.id)) > 0:
                return obj.has_only_dirty_remarks(request.data)
        elif request.method == 'DELETE':
            return len(DistributionPlan.objects.filter(consignee=obj.id)) == 0

        return True