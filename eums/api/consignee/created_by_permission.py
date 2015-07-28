from eums.models import DistributionPlan, UserProfile
from rest_framework import permissions


class CreatedByPermission(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser:
            return True
        if request.method == 'DELETE':
            request_user_group = request.user.groups.first()
            obj_user_group = obj.created_by_user.groups.first()
            if request_user_group.name == 'Implementing Partner_editor':
                if obj_user_group.name in ['UNICEF_admin', 'UNICEF_editor']:
                    return False

                request_profile = UserProfile.objects.get(user=request.user)
                obj_profile = UserProfile.objects.get(user=obj.created_by_user)
                return request_profile.consignee == obj_profile.consignee
        return True
