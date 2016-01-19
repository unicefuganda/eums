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


class BaseBusinessPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        user_permission = self.supported_permissions.get(request.method) if hasattr(self,
                                                                                    'supported_permissions') else None

        if not request.user.has_perm('eums.%s' % user_permission) and not request.user.has_perm(
                        'auth.%s' % user_permission):
            raise ForbiddenException('Unauthorised!')
        return True
