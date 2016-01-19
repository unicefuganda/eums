from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType

GROUP_UNICEF_ADMIN = 'UNICEF_admin'
GROUP_UNICEF_EDITOR = 'UNICEF_editor'
GROUP_UNICEF_VIEWER = 'UNICEF_viewer'
GROUP_IP_EDITOR = 'Implementing Partner_editor'
GROUP_IP_VIEWER = 'Implementing Partner_viewer'


class PermissionCode(object):
    CAN_VIEW_DASHBOARD = 'can_view_dashboard'

    CAN_VIEW_USER = 'can_view_users'
    CAN_ADD_USER = 'add_user'
    CAN_CHANGE_USER = 'change_user'

    CAN_VIEW_DISTRIBUTION_PLAN = 'can_view_distribution_plans'
    CAN_ADD_DISTRIBUTION_PLAN = 'add_distributionplan'

    CAN_VIEW_REPORTS = 'can_view_reports'
    CAN_TRACK_DISTRIBUTION_PLAN = 'can_track_deliveries'
    CAN_VIEW_UNICEF_MENU = 'can_view_unicef_menu'
    CAN_VIEW_DELIVERY_REPORTS = 'can_view_delivery_reports'
    CAN_CREATE_DELIVERY_REPORTS = 'can_create_delivery_reports'
    CAN_ACKNOWLEDGE_DELIVERIES = 'can_acknowledge_deliveries'
    CAN_VIEW_FIELD_VERIFICATION_REPORTS = 'can_view_field_verification_reports'
    CAN_CREATE_FIELD_VERIFICATION_REPORTS = 'can_create_field_verification_reports'
    CAN_VIEW_IP_STOCK_REPORTS = 'can_view_ip_stock_reports'
    CAN_VIEW_END_USER_FEEDBACK_REPORTS = 'can_view_end_user_feedback_reports'
    CAN_VIEW_CUB_CONSIGNEE_FEEDBACK_REPORTS = 'can_view_cub_consignee_feedback_reports'
    CAN_VIEW_IP_FEEDBACK_REPORTS = 'can_view_ip_feedback_reports'
    CAN_VIEW_CONSIGNEES = 'can_view_consignees'
    CAN_IMPORT_DATA = 'can_import_data'
    CAN_VIEW_SELF_CONTACTS = 'can_view_self_contacts'
    CAN_VIEW_CONTACTS = 'can_view_contacts'
    CAN_CREATE_CONTACTS = 'can_create_contacts'
    CAN_EDIT_CONTACTS = 'can_edit_contacts'
    CAN_PUSH_CONTACTS_TO_RAPID_PRO = 'can_push_contacts_to_rapid_pro'

    CAN_VIEW_PURCHASE_ORDER = 'can_view_purchase_order'
    CAN_VIEW_RELEASE_ORDER = 'can_view_release_order'


perm_code_names = [
    {'name': 'Can view users', 'codename': PermissionCode.CAN_VIEW_USER},
    {'name': 'Can view dashboard', 'codename': PermissionCode.CAN_VIEW_DASHBOARD},
    {'name': 'Can view distribution plans', 'codename': PermissionCode.CAN_VIEW_DISTRIBUTION_PLAN},
    {'name': 'Can view reports', 'codename': PermissionCode.CAN_VIEW_REPORTS},
    {'name': 'Can track deliveries', 'codename': PermissionCode.CAN_TRACK_DISTRIBUTION_PLAN},
    {'name': 'Can view unicef menu', 'codename': PermissionCode.CAN_VIEW_UNICEF_MENU},

    {'name': 'Can view delivery reports', 'codename': PermissionCode.CAN_VIEW_DELIVERY_REPORTS},
    {'name': 'Can create delivery reports', 'codename': PermissionCode.CAN_CREATE_DELIVERY_REPORTS},
    {'name': 'Can acknowledge deliveries', 'codename': PermissionCode.CAN_ACKNOWLEDGE_DELIVERIES},

    {'name': 'Can view field verification reports',
     'codename': PermissionCode.CAN_VIEW_FIELD_VERIFICATION_REPORTS},
    {'name': 'Can create field verification reports',
     'codename': PermissionCode.CAN_CREATE_FIELD_VERIFICATION_REPORTS},

    {'name': 'Can view IP stock reports', 'codename': PermissionCode.CAN_VIEW_IP_STOCK_REPORTS},
    {'name': 'Can view End User feedback reports',
     'codename': PermissionCode.CAN_VIEW_END_USER_FEEDBACK_REPORTS},
    {'name': 'Can view Sub Consignee feedback reports',
     'codename': PermissionCode.CAN_VIEW_CUB_CONSIGNEE_FEEDBACK_REPORTS},
    {'name': 'Can view IP feedback reports', 'codename': PermissionCode.CAN_VIEW_IP_FEEDBACK_REPORTS},

    {'name': 'Can view consignees', 'codename': PermissionCode.CAN_VIEW_CONSIGNEES},
    {'name': 'Can import data', 'codename': PermissionCode.CAN_IMPORT_DATA},

    {'name': 'Can view self contacts', 'codename': PermissionCode.CAN_VIEW_SELF_CONTACTS},
    {'name': 'Can view contacts', 'codename': PermissionCode.CAN_VIEW_CONTACTS},
    {'name': 'Can create contacts', 'codename': PermissionCode.CAN_CREATE_CONTACTS},
    {'name': 'Can edit contacts', 'codename': PermissionCode.CAN_EDIT_CONTACTS},
    {'name': 'Can push contacts to RapidPro', 'codename': PermissionCode.CAN_PUSH_CONTACTS_TO_RAPID_PRO},

    {'name': 'Can view purchase orders', 'codename': PermissionCode.CAN_VIEW_PURCHASE_ORDER},
    {'name': 'Can view release orders', 'codename': PermissionCode.CAN_VIEW_RELEASE_ORDER},
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
            Permission.objects.get_or_create(name=perm['name'], codename=perm['codename'],
                                             content_type=auth_content)
