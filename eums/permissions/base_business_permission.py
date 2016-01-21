import logging

from eums.auth import PermissionCode
from eums.exceptions import ForbiddenException
from rest_framework import permissions

logger = logging.getLogger(__name__)


def build_request_permissions(model):
    upper_model_name = model.upper()
    request_permissions = {'GET': getattr(PermissionCode, 'CAN_VIEW_%s' % upper_model_name, None),
                           'POST': getattr(PermissionCode, 'CAN_ADD_%s' % upper_model_name, None),
                           'PUT': getattr(PermissionCode, 'CAN_CHANGE_%s' % upper_model_name, None),
                           'DELETE': getattr(PermissionCode, 'CAN_DELETE_%s' % upper_model_name, None),
                           'PATCH': getattr(PermissionCode, 'CAN_PATCH_%s' % upper_model_name, None)}
    return request_permissions


def is_user_has_permission(user, permission):
    return user.has_perm('eums.%s' % permission) or user.has_perm(
            'auth.%s' % permission)


class BaseBusinessPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        user_permission = None
        if hasattr(self, 'request_permissions'):
            user_permission = self.request_permissions.get(request.method)
        logger.info('user=%s, permission=%s' % (request.user, user_permission))
        if not is_user_has_permission(request.user, user_permission):
            raise ForbiddenException('Unauthorised!')
        return True
