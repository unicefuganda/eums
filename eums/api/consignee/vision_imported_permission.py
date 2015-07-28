from rest_framework import permissions


class VisionImportedPermission(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method == 'PUT':
            if obj.imported_from_vision:
                return obj.has_only_dirty_remarks(request.data)
        elif request.method == 'DELETE':
            return not obj.imported_from_vision

        return True