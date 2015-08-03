from eums.exceptions import ForbiddenException
from rest_framework import permissions


class ViewDeliveryPermission(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method == 'GET':
            if not request.user.has_perm('auth.can_view_distribution_plans'):
                raise ForbiddenException('Unauthorised!')

            return True