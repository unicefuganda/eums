import csv
from django.core import mail
from eums.models import ReleaseOrderItem, DistributionPlanNode
from eums.celery import app
from django.conf import settings


class CSV_Export_Service(object):
    END_USER_RESPONSE = {True: 'Yes', False: 'No'}
    FILENAME = 'warehouse_deliveries.csv'
    HEADER = [
        'Waybill', 'Item Description', 'Material Code', 'Quantity Shipped', 'Shipment Date',
        'Implementing Partner', 'Contact Person', 'Contact Number', 'District', 'Is End User',
        'Is Tracked'
    ]

    def __init__(self, type):
        self.type = type

    def data(self):
        release_order_item_ids = ReleaseOrderItem.objects.values_list('id', flat=True);
        warehouse_nodes = DistributionPlanNode.objects.filter(item__id__in=release_order_item_ids)
        response_nodes = [self.HEADER]
        for node in warehouse_nodes:
            response_nodes.append(self._get_data(node))
        return response_nodes

    def _get_data(self, node):
        contact = node.contact
        contact_person = contact.full_name()
        contact_number = contact.phone
        is_end_user = self.END_USER_RESPONSE[node.is_end_user()]
        is_tracked = self.END_USER_RESPONSE[node.track]

        return [node.number(), node.item_description(), node.item.item.material_code, node.quantity_in(),
                node.delivery_date.isoformat(), node.ip.name, contact_person, contact_number,
                node.location, is_end_user, is_tracked]

    def generate(self):
        file_location = settings.EXPORTS_DIR + self.FILENAME
        export_file = open(file_location, 'wb')
        wr = csv.writer(export_file, quoting=csv.QUOTE_ALL)
        wr.writerows(self.data())

    def notify(self, user):
        subject = "Warehouse Delivery Download"
        csv_url = 'http://%s/static/exports/%s' % (settings.HOSTNAME, self.FILENAME)
        first_name = getattr(user, 'first_name', 'EUMS User')
        message = settings.EMAIL_NOTIFICATION_CONTENT % (first_name, csv_url)
        if getattr(user, 'email', None):
            mail.send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email])


@app.task
def generate_waybill_csv(user):
    csv = CSV_Export_Service(ReleaseOrderItem.WAYBILL)
    csv.generate()
    csv.notify(user)