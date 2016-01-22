import logging

from eums.permissions.base_business_permission import BaseBusinessPermission, build_request_permissions

logger = logging.getLogger(__name__)


class ItemFeedbackReportPermissions(BaseBusinessPermission):
    request_permissions = build_request_permissions('item_feedback_report')
