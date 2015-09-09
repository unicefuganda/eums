from django.contrib.auth.models import User
from django.contrib.auth.models import Group
from eums.models import Consignee
from eums.models import UserProfile

implementingPartnerEditor = Group.objects.get(name="Implementing Partner_editor")
implementingPartnerViewer = Group.objects.get(name="Implementing Partner_viewer")
unicefAdminGroup = Group.objects.get(name="UNICEF_admin")
unicefViewerGroup = Group.objects.get(name="UNICEF_viewer")
unicefEditorGroup = Group.objects.get(name="UNICEF_editor")

admin = User.objects.create(username="admin",
            first_name="",
            last_name="",
            is_active=True,
            is_superuser=True,
            is_staff=True,
            last_login="2014-11-12T18:01:17.689",
            password="pbkdf2_sha256$12000$Qm6uxNGdbAJk$bia6J/PwzJ67iK9gC1fbY0nlKgNNK0F1x8fcST48BAY=",
            email="admin@tw.org",
            date_joined="2014-10-13T11:21:57.796")

wakiso = User.objects.create(username="wakiso",
            first_name="",
            last_name="",
            is_active=True,
            is_superuser=False,
            is_staff=False,
            last_login="2015-02-04T17:02:46.534",
            password="pbkdf2_sha256$12000$zXues7bdIbYE$Agj3fZdiacmK5JJriCkDgcNvn/Q53JCDvfF37i+mPJ4=",
            email="ip@ip.com",
            date_joined="2014-12-03T17:40:36.415")
wakiso.groups = [ implementingPartnerEditor ]
wakiso.save()

wakisoViewer = User.objects.create(username="wakiso_viewer",
            first_name="",
            last_name="",
            is_active=True,
            is_superuser=False,
            is_staff=False,
            last_login="2015-02-04T17:02:46.534",
            password="pbkdf2_sha256$12000$zXues7bdIbYE$Agj3fZdiacmK5JJriCkDgcNvn/Q53JCDvfF37i+mPJ4=",
            email="ip@ip.com",
            date_joined="2014-12-03T17:40:36.415")
wakisoViewer.groups = [ implementingPartnerViewer ]
wakisoViewer.save()

unicefAdmin = User.objects.create(username="unicef_admin",
            first_name="",
            last_name="",
            is_active=True,
            is_superuser=False,
            is_staff=False,
            last_login="2015-02-04T17:02:46.534",
            password="pbkdf2_sha256$12000$zXues7bdIbYE$Agj3fZdiacmK5JJriCkDgcNvn/Q53JCDvfF37i+mPJ4=",
            email="ip@ip.com",
            date_joined="2014-12-03T17:40:36.415")
unicefAdmin.groups = [ unicefAdminGroup ]
unicefAdmin.save()

unicefEditor = User.objects.create(username="unicef_editor",
            first_name="",
            last_name="",
            is_active=True,
            is_superuser=False,
            is_staff=False,
            last_login="2015-02-04T17:02:46.534",
            password="pbkdf2_sha256$12000$zXues7bdIbYE$Agj3fZdiacmK5JJriCkDgcNvn/Q53JCDvfF37i+mPJ4=",
            email="ip@ip.com",
            date_joined="2014-12-03T17:40:36.415")
unicefEditor.groups = [ unicefEditorGroup ]
unicefEditor.save()

unicefViewer = User.objects.create(username="unicef_viewer",
            first_name="",
            last_name="",
            is_active=True,
            is_superuser=False,
            is_staff=False,
            last_login="2015-02-04T17:02:46.534",
            password="pbkdf2_sha256$12000$zXues7bdIbYE$Agj3fZdiacmK5JJriCkDgcNvn/Q53JCDvfF37i+mPJ4=",
            email="ip@ip.com",
            date_joined="2014-12-03T17:40:36.415")
unicefViewer.groups = [ unicefViewerGroup ]
unicefViewer.save()


wakisoConsignee = Consignee.objects.create(customer_id="L438000484",
            type="implementing_partner",
            name="WAKISO DHO",
            imported_from_vision=True)

UserProfile.objects.create(user=wakiso,
            consignee=wakisoConsignee,
            modified="2014-12-03T17:40:36.537",
            created="2014-12-03T17:40:36.534")

UserProfile.objects.create(user=wakisoViewer,
            consignee=wakisoConsignee,
            modified="2014-12-03T17:40:36.537",
            created="2014-12-03T17:40:36.534")
