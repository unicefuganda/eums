from eums.models import UserProfile
from eums.exceptions import ForbiddenException
from rest_framework import permissions


class CreatedByPermission(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        forbidden_message = "Permission Denied: Consignee was not created by your organization"
        if request.user.is_superuser:
            return True
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
                    raise ForbiddenException(forbidden_message)

                request_profile = UserProfile.objects.get(user=request.user)
                obj_profile = UserProfile.objects.get(user=obj.created_by_user)
                if request_profile.consignee != obj_profile.consignee:
                    raise ForbiddenException(forbidden_message)

        return True
