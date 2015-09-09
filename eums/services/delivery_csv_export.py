from eums import settings
from eums.models import ReleaseOrderItem, DistributionPlanNode

__author__ = 'jafari'


class DeliveryCSVExport(object):
    END_USER_RESPONSE = {True: 'Yes', False: 'No'}
    SUBJECT_TYPE = {ReleaseOrderItem.WAYBILL: 'Warehouse'}
    FILENAME = 'warehouse_deliveries.csv'
    HEADER = [
        'Waybill', 'Item Description', 'Material Code', 'Quantity Shipped', 'Shipment Date',
        'Implementing Partner', 'Contact Person', 'Contact Number', 'District', 'Is End User',
        'Is Tracked'
    ]

    def __init__(self, type_):
        self.type = type_

    def _message(self):
        csv_url = 'http://%s/static/exports/%s' % (settings.HOSTNAME, self.FILENAME)
        return settings.EMAIL_NOTIFICATION_CONTENT % (self.FILENAME, csv_url)

    def _subject(self):
        return "%s Delivery Download" % self.SUBJECT_TYPE[self.type]

    def notification_details(self):
        return self._subject(), self._message()

    def data(self):
        release_order_item_ids = ReleaseOrderItem.objects.values_list('id', flat=True)
        warehouse_nodes = DistributionPlanNode.objects.filter(item__id__in=release_order_item_ids)
        response_nodes = [self.HEADER]
        for node in warehouse_nodes:
            response_nodes.append(self._export_data(node))
        return response_nodes

    def _export_data(self, node):
        contact = node.contact
        is_end_user = self.END_USER_RESPONSE[node.is_end_user()]
        is_tracked = self.END_USER_RESPONSE[node.track]

        return [node.number(), node.item_description(), node.item.item.material_code, node.quantity_in(),
                node.delivery_date.isoformat(), node.ip.name, contact.full_name(), contact.phone,
                node.location, is_end_user, is_tracked]