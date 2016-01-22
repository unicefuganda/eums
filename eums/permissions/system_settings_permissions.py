import logging

from eums.permissions.base_business_permission import BaseBusinessPermission, build_request_permissions

logger = logging.getLogger(__name__)


class SystemSettingsPermissions(BaseBusinessPermission):
    request_permissions = build_request_permissions('system_settings')
