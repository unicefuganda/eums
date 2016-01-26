import logging

from eums.auth import GROUP_IP_EDITOR, GROUP_UNICEF_EDITOR, GROUP_UNICEF_ADMIN
from eums.exceptions import ForbiddenException
from eums.models import DistributionPlanNode, UserProfile
from eums.permissions.base_business_permission import BaseBusinessPermission, build_request_permissions

logger = logging.getLogger(__name__)


def is_consignee_belong_to_request_user(obj, request):
    if request.method in ['DELETE', 'PUT']:
        if obj.created_by_user is None or (obj.has_only_dirty_remarks(request.data) and request.method == 'PUT'):
            return True

        request_user_group = request.user.groups.first()
        obj_user_group = obj.created_by_user.groups.first()
        if request_user_group.name == GROUP_IP_EDITOR:
            if obj_user_group.name in [GROUP_UNICEF_ADMIN, GROUP_UNICEF_EDITOR]:
                return False

            request_profile = UserProfile.objects.get(user=request.user)
            obj_profile = UserProfile.objects.get(user=obj.created_by_user)
            if request_profile.consignee != obj_profile.consignee:
                return False
    return True


def has_permission_to_update_or_delete_with_error_msg(obj, request):
    if request.method == 'PUT' and not obj.has_only_dirty_remarks(request.data) or request.method == 'DELETE':
        if obj.imported_from_vision:
            return False, 'Permission Denied: Consignee was imported from Vision'

        if DistributionPlanNode.objects.filter(consignee=obj.id).exists():
            return False, 'Permission Denied: Consignee has an attached delivery'

        if not is_consignee_belong_to_request_user(obj, request):
            return False, 'Permission Denied: Consignee was not created by your organization'

    return True, None


class ConsigneePermissions(BaseBusinessPermission):
    request_permissions = build_request_permissions('consignee')

    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser:
            return True

        has_permission, error_msg = has_permission_to_update_or_delete_with_error_msg(obj, request)
        if not has_permission:
            raise ForbiddenException(error_msg)
        return True
