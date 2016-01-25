import logging

from eums.auth import GROUP_IP_EDITOR, GROUP_UNICEF_EDITOR, GROUP_UNICEF_ADMIN
from eums.exceptions import ForbiddenException
from eums.models import DistributionPlanNode, UserProfile
from eums.permissions.base_business_permission import BaseBusinessPermission, build_request_permissions

logger = logging.getLogger(__name__)


def is_consignee_belong_to_request_user(obj, request):
    if request.method in ['DELETE', 'PUT']:
        if obj.created_by_user is None:
            return True
        if obj.has_only_dirty_remarks(request.data) and request.method == 'PUT':
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


def is_import_or_in_use_with_message(obj):
    if obj.imported_from_vision:
        return True, 'Permission Denied: Consignee was imported from Vision'
    if DistributionPlanNode.objects.filter(consignee=obj.id).exists():
        return True, 'Permission Denied: Consignee has an attached delivery'

    return False, None


class ConsigneePermissions(BaseBusinessPermission):
    request_permissions = build_request_permissions('consignee')

    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser:
            return True

        if request.method == 'PUT' and not obj.has_only_dirty_remarks(request.data) or request.method == 'DELETE':
            is_import_or_in_use, error_message = is_import_or_in_use_with_message(obj)
            if is_import_or_in_use:
                raise ForbiddenException(error_message)

        forbidden_not_owner_message = 'Permission Denied: Consignee was not created by your organization'

        if not is_consignee_belong_to_request_user(obj, request):
            raise ForbiddenException(forbidden_not_owner_message)

        return True
