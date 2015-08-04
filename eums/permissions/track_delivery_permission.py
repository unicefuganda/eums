from eums.exceptions import ForbiddenException
from rest_framework import permissions


class TrackDeliveryPermission(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        print 'method', request.method
        if request.method == 'POST' or request.method == 'PUT':
            if request.data['track'] is True and not request.user.has_perm('auth.can_track_deliveries'):
                    raise ForbiddenException('Unauthorised!')
        return True