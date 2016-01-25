from rest_framework import permissions
from eums.exceptions import ForbiddenException
from eums.models import DistributionPlanNode, UserProfile


class VisionImportedPermission(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        forbidden_import_data_message = "Permission Denied: Consignee was imported from Vision"
        forbidden_attached_message = "Permission Denied: Consignee has an attached delivery"
        if request.method == 'PUT':
            if obj.imported_from_vision:
                if not obj.has_only_dirty_remarks(request.data):
                    raise ForbiddenException(forbidden_import_data_message)

            if DistributionPlanNode.objects.filter(consignee=obj.id).exists():
                if not obj.has_only_dirty_remarks(request.data):
                    raise ForbiddenException(forbidden_attached_message)

        elif request.method == 'DELETE':
            if obj.imported_from_vision:
                raise ForbiddenException(forbidden_import_data_message)

            if DistributionPlanNode.objects.filter(consignee=obj.id).exists():
                raise ForbiddenException(forbidden_attached_message)

        forbidden_not_owner_message = "Permission Denied: Consignee was not created by your organization"
        if request.method in ['DELETE', 'PUT']:
            # Need this check until we can create vision import user
            if obj.created_by_user is None:
                return True
            if obj.has_only_dirty_remarks(request.data) and request.method == 'PUT':
                return True
            request_user_group = request.user.groups.first()
            obj_user_group = obj.created_by_user.groups.first()
            if request_user_group.name == 'Implementing Partner_editor':
                if obj_user_group.name in ['UNICEF_admin', 'UNICEF_editor']:
                    raise ForbiddenException(forbidden_not_owner_message)

                request_profile = UserProfile.objects.get(user=request.user)
                obj_profile = UserProfile.objects.get(user=obj.created_by_user)
                if request_profile.consignee != obj_profile.consignee:
                    raise ForbiddenException(forbidden_not_owner_message)

        return True
