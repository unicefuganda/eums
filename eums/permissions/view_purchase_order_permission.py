import logging

from eums.auth import CustomerPermissionCode
from eums.exceptions import ForbiddenException
from rest_framework import permissions

logger = logging.getLogger(__name__)


class ViewPurchaseOrderPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method == 'GET':
            if not request.user.has_perm('auth.%s' % CustomerPermissionCode.CAN_VIEW_PURCHASE_ORDER):
                raise ForbiddenException('Unauthorised!')
        return True
