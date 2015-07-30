from eums.models import DistributionPlanNode
from eums.exceptions import ForbiddenException
from rest_framework import permissions


class DeliveryAttachedPermission(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        forbidden_message = "Permission Denied: Consignee has an attached delivery"
        if request.method == 'PUT':
            if DistributionPlanNode.objects.filter(consignee=obj.id).exists():
                if not obj.has_only_dirty_remarks(request.data):
                    raise ForbiddenException(forbidden_message)
        elif request.method == 'DELETE':
            if DistributionPlanNode.objects.filter(consignee=obj.id).exists():
                raise ForbiddenException(forbidden_message)

        return True
