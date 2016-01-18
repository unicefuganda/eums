import logging

from eums.exceptions import ForbiddenException
from rest_framework import permissions

logger = logging.getLogger(__name__)


class ViewPurchaseOrderPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        print '============================loging user name = %s%s' % (request.user.name, '========================')
        print '============================loging group name = %s%s' % (request.user.group.name, '====================')
        if request.method == 'GET':
            if not request.user.has_perm('auth.can_view_purchase_order'):
                raise ForbiddenException('Unauthorised!')
        return True
