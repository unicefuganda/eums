from rest_framework import permissions
from eums.exceptions import ForbiddenException


class VisionImportedPermission(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        forbidden_message = "Permission Denied: Consignee was imported from Vision"
        if request.method == 'PUT':
            if obj.imported_from_vision:
                if not obj.has_only_dirty_remarks(request.data):
                    raise ForbiddenException(forbidden_message)
        elif request.method == 'DELETE':
            if obj.imported_from_vision:
                raise ForbiddenException(forbidden_message)
        return True
