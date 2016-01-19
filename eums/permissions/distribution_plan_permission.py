import logging

from eums.permissions.base_business_permission import BaseBusinessPermission, build_request_permissions

logger = logging.getLogger(__name__)


class DistributionPlanPermission(BaseBusinessPermission):
    supported_permissions = build_request_permissions('distribution_plan')
