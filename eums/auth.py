from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType

GROUP_UNICEF_ADMIN = 'UNICEF_admin'
GROUP_UNICEF_EDITOR = 'UNICEF_editor'
GROUP_UNICEF_VIEWER = 'UNICEF_viewer'
GROUP_IP_EDITOR = 'Implementing Partner_editor'
GROUP_IP_VIEWER = 'Implementing Partner_viewer'


class PermissionCode(object):
    CAN_VIEW_DASH_BOARD = 'can_view_dashboard'

    CAN_VIEW_USER = 'can_view_users'
    CAN_ADD_USER = 'add_user'
    CAN_CHANGE_USER = 'change_user'

    CAN_VIEW_DISTRIBUTION_PLANS = 'can_view_distribution_plans'
    CAN_VIEW_DISTRIBUTION_PLAN = 'can_view_distribution_plan'
    CAN_ADD_DISTRIBUTION_PLAN = 'add_distributionplan'
    CAN_CHANGE_DISTRIBUTION_PLAN = 'change_distributionplan'
    CAN_PATCH_DISTRIBUTION_PLAN = 'change_distributionplan'

    CAN_VIEW_DISTRIBUTION_PLAN_NODE = 'can_view_distribution_plan_node'
    CAN_ADD_DISTRIBUTION_PLAN_NODE = 'add_distributionplannode'
    CAN_CHANGE_DISTRIBUTION_PLAN_NODE = 'change_distributionplannode'

    CAN_VIEW_CONSIGNEE_ITEM = 'can_view_consignee_item'
    CAN_VIEW_ITEM = 'can_view_item'

    CAN_VIEW_UNICEF_MENU = 'can_view_unicef_menu'

    CAN_VIEW_IP_STOCK_REPORTS = 'can_view_ip_stock_reports'
    CAN_VIEW_END_USER_FEEDBACK_REPORTS = 'can_view_end_user_feedback_reports'
    CAN_VIEW_CUB_CONSIGNEE_FEEDBACK_REPORTS = 'can_view_cub_consignee_feedback_reports'
    CAN_VIEW_IP_FEEDBACK_REPORTS = 'can_view_ip_feedback_reports'

    CAN_VIEW_STOCK_REPORT = 'can_view_stock_report'
    CAN_VIEW_ITEM_FEEDBACK_REPORT = 'can_view_item_feedback_report'
    CAN_VIEW_DELIVERY_FEEDBACK_REPORT = 'can_view_delivery_feedback_report'
    CAN_VIEW_SUPPLY_EFFICIENCY_REPORT = 'can_view_supply_efficiency_report'

    CAN_IMPORT_DATA = 'can_import_data'

    CAN_VIEW_SELF_CONTACT = 'can_view_self_contacts'
    CAN_VIEW_CONTACT = 'can_view_contacts'
    CAN_CREATE_CONTACT = 'can_create_contacts'
    CAN_EDIT_CONTACT = 'can_edit_contacts'
    CAN_DELETE_CONTACT = 'can_delete_contacts'

    CAN_PUSH_CONTACTS_TO_RAPID_PRO = 'can_push_contacts_to_rapid_pro'

    CAN_ADD_CONSIGNEE = 'add_consignee'
    CAN_DELETE_CONSIGNEE = 'delete_consignee'
    CAN_CHANGE_CONSIGNEE = 'change_consignee'
    CAN_VIEW_CONSIGNEE = 'can_view_consignees'

    CAN_VIEW_PURCHASE_ORDER = 'can_view_purchase_order'
    CAN_PATCH_PURCHASE_ORDER = 'change_purchaseorder'

    CAN_VIEW_RELEASE_ORDER = 'can_view_release_order'

    CAN_VIEW_ALERT = 'can_view_alert'
    CAN_CHANGE_ALERT = 'change_alert'
    CAN_ADD_ALERT = 'add_alert'
    CAN_PATCH_ALERT = 'change_alert'

    CAN_VIEW_SYSTEM_SETTINGS = 'can_view_system_settings'
    CAN_CHANGE_SYSTEM_SETTINGS = 'change_systemsettings'
    CAN_ADD_WEB_ANSWER = 'add_web_answer'

    CAN_ADD_UPLOAD = 'add_upload'
    CAN_CHANGE_UPLOAD = 'change_upload'
    CAN_DELETE_UPLOAD = 'delete_upload'


perm_code_names = [

    {'name': 'Can view dashboard', 'codename': PermissionCode.CAN_VIEW_DASH_BOARD},
    {'name': 'Can view unicef menu', 'codename': PermissionCode.CAN_VIEW_UNICEF_MENU},

    {'name': 'Can view users', 'codename': PermissionCode.CAN_VIEW_USER},

    {'name': 'Can view single distribution plan', 'codename': PermissionCode.CAN_VIEW_DISTRIBUTION_PLAN},
    {'name': 'Can view distribution plans', 'codename': PermissionCode.CAN_VIEW_DISTRIBUTION_PLANS},

    {'name': 'Can view distribution plan nodes', 'codename': PermissionCode.CAN_VIEW_DISTRIBUTION_PLAN_NODE},

    {'name': 'Can view stock reports', 'codename': PermissionCode.CAN_VIEW_STOCK_REPORT},
    {'name': 'Can view item feedback reports', 'codename': PermissionCode.CAN_VIEW_ITEM_FEEDBACK_REPORT},
    {'name': 'Can view delivery feedback reports', 'codename': PermissionCode.CAN_VIEW_DELIVERY_FEEDBACK_REPORT},
    {'name': 'Can view supply efficiency reports', 'codename': PermissionCode.CAN_VIEW_SUPPLY_EFFICIENCY_REPORT},

    {'name': 'Can view IP stock reports', 'codename': PermissionCode.CAN_VIEW_IP_STOCK_REPORTS},
    {'name': 'Can view End User feedback reports',
     'codename': PermissionCode.CAN_VIEW_END_USER_FEEDBACK_REPORTS},
    {'name': 'Can view Sub Consignee feedback reports',
     'codename': PermissionCode.CAN_VIEW_CUB_CONSIGNEE_FEEDBACK_REPORTS},
    {'name': 'Can view IP feedback reports', 'codename': PermissionCode.CAN_VIEW_IP_FEEDBACK_REPORTS},

    {'name': 'Can view consignees', 'codename': PermissionCode.CAN_VIEW_CONSIGNEE},
    {'name': 'Can import data', 'codename': PermissionCode.CAN_IMPORT_DATA},

    {'name': 'Can view self contacts', 'codename': PermissionCode.CAN_VIEW_SELF_CONTACT},
    {'name': 'Can view contacts', 'codename': PermissionCode.CAN_VIEW_CONTACT},
    {'name': 'Can create contacts', 'codename': PermissionCode.CAN_CREATE_CONTACT},
    {'name': 'Can edit contacts', 'codename': PermissionCode.CAN_EDIT_CONTACT},
    {'name': 'Can delete contacts', 'codename': PermissionCode.CAN_DELETE_CONTACT},
    {'name': 'Can push contacts to RapidPro', 'codename': PermissionCode.CAN_PUSH_CONTACTS_TO_RAPID_PRO},

    {'name': 'Can view purchase orders', 'codename': PermissionCode.CAN_VIEW_PURCHASE_ORDER},
    {'name': 'Can view release orders', 'codename': PermissionCode.CAN_VIEW_RELEASE_ORDER},

    {'name': 'Can view consignee item', 'codename': PermissionCode.CAN_VIEW_CONSIGNEE_ITEM},
    {'name': 'Can view item', 'codename': PermissionCode.CAN_VIEW_ITEM},

    {'name': 'Can view alert', 'codename': PermissionCode.CAN_VIEW_ALERT},
    {'name': 'Can view system settings', 'codename': PermissionCode.CAN_VIEW_SYSTEM_SETTINGS},
    {'name': 'Can add web answer', 'codename': PermissionCode.CAN_ADD_WEB_ANSWER},
]


def teardown_groups():
    Group.objects.get(name=GROUP_UNICEF_ADMIN).delete()
    Group.objects.get(name=GROUP_UNICEF_EDITOR).delete()
    Group.objects.get(name=GROUP_UNICEF_VIEWER).delete()
    Group.objects.get(name=GROUP_IP_EDITOR).delete()
    Group.objects.get(name=GROUP_IP_VIEWER).delete()


def create_groups():
    Group.objects.get_or_create(name=GROUP_UNICEF_ADMIN)
    Group.objects.get_or_create(name=GROUP_UNICEF_EDITOR)
    Group.objects.get_or_create(name=GROUP_UNICEF_VIEWER)
    Group.objects.get_or_create(name=GROUP_IP_EDITOR)
    Group.objects.get_or_create(name=GROUP_IP_VIEWER)


def create_permissions():
    auth_content = ContentType.objects.get_for_model(Permission)
    if auth_content:
        for perm in perm_code_names:
            Permission.objects.get_or_create(name=perm['name'], codename=perm['codename'], content_type=auth_content)
