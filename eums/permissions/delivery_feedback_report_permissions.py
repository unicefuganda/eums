import logging

from eums.permissions.base_business_permission import BaseBusinessPermission, build_request_permissions

logger = logging.getLogger(__name__)


class DeliveryFeedbackReportPermissions(BaseBusinessPermission):
    request_permissions = build_request_permissions('delivery_feedback_report')
