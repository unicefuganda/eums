import logging

from eums.auth import PermissionCode
from eums.exceptions import ForbiddenException
from rest_framework import permissions

from eums.permissions.base_business_permission import BaseBusinessPermission, build_request_permissions

logger = logging.getLogger(__name__)


class ViewPurchaseOrderPermission(BaseBusinessPermission):
    supported_permissions = build_request_permissions('purchase_order')
