from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType


def teardown_groups():
    Group.objects.get(name='UNICEF_admin').delete()
    Group.objects.get(name='UNICEF_editor').delete()
    Group.objects.get(name='UNICEF_viewer').delete()
    Group.objects.get(name='Implementing Partner_editor').delete()
    Group.objects.get(name='Implementing Partner_viewer').delete()


def create_groups():
    Group.objects.get_or_create(name='UNICEF_admin')
    Group.objects.get_or_create(name='UNICEF_editor')
    Group.objects.get_or_create(name='UNICEF_viewer')
    Group.objects.get_or_create(name='Implementing Partner_editor')
    Group.objects.get_or_create(name='Implementing Partner_viewer')

perm_code_names = [
    {'name': 'Can view users', 'codename': 'can_view_users'},
    {'name': 'Can view dashboard', 'codename': 'can_view_dashboard'},
    {'name': 'Can view distribution plans', 'codename': 'can_view_distribution_plans'},
    {'name': 'Can view reports', 'codename': 'can_view_reports'},
    {'name': 'Can view contacts', 'codename': 'can_view_contacts'},
    {'name': 'Can view deliveries', 'codename': 'can_view_deliveries'},
    {'name': 'Can create deliveries', 'codename': 'can_create_deliveries'},
    {'name': 'Can track deliveries', 'codename': 'can_track_deliveries'},
    {'name': 'Can view unicef menu', 'codename': 'can_view_unicef_menu'},

    {'name': 'Can view delivery reports', 'codename': 'can_view_delivery_reports'},
    {'name': 'Can create delivery reports', 'codename': 'can_create_delivery_reports'},
    {'name': 'Can acknowledge deliveries', 'codename': 'can_acknowledge_deliveries'},

    {'name': 'Can view field verification reports', 'codename': 'can_view_field_verification_reports'},
    {'name': 'Can create field verification reports', 'codename': 'can_create_field_verification_reports'},

    {'name': 'Can view IP stock reports', 'codename': 'can_view_ip_stock_reports'},
    {'name': 'Can view End User feedback reports', 'codename': 'can_view_end_user_feedback_reports'},
    {'name': 'Can view Sub Consignee feedback reports', 'codename': 'can_view_cub_consignee_feedback_reports'},
    {'name': 'Can view IP feedback reports', 'codename': 'can_view_ip_feedback_reports'},

    {'name': 'Can view consignees', 'codename': 'can_view_consignees'},
    {'name': 'Can import data', 'codename': 'can_import_data'},

    {'name': 'Can create contacts', 'codename': 'can_create_contacts'},
    {'name': 'Can edit contacts', 'codename': 'can_edit_contacts'},
    {'name': 'Can push contacts to RapidPro', 'codename': 'can_push_contacts_to_rapid_pro'},
]


def create_permissions():
    auth_content = ContentType.objects.get_for_model(Permission)
    if auth_content:
        for perm in perm_code_names:
            created_perm, out = Permission.objects.get_or_create(name=perm['name'], codename=perm['codename'],
                                                                 content_type=auth_content)


def teardown_permissions():
    for perm in perm_code_names:
        try:
            Permission.objects.get(codename=perm['codename']).delete()
        except:
            pass
