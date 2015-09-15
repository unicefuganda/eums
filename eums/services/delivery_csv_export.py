from django.conf import settings
from eums.models import ReleaseOrderItem, DistributionPlanNode, PurchaseOrderItem


class DeliveryCSVExport(object):
    END_USER_RESPONSE = {True: 'Yes', False: 'No'}
    COMMON_HEADER = ['Item Description', 'Material Code', 'Quantity Shipped', 'Shipment Date',
                     'Implementing Partner', 'Contact Person', 'Contact Number', 'District', 'Is End User',
                     'Is Tracked']

    def __init__(self):
        self.header = self._set_export_header()

    def _set_export_header(self):
        header = [self.export_header]
        header.extend(self.COMMON_HEADER)
        return header

    def _message(self):
        csv_url = 'http://%s/static/exports/%s' % (settings.HOSTNAME, self.export_filename)
        return settings.EMAIL_NOTIFICATION_CONTENT.format(self.export_label, csv_url)

    def _subject(self):
        return "%s Delivery Download" % self.export_label

    def notification_details(self):
        return self._subject(), self._message()

    def data(self):
        item_ids = self.item_class.objects.values_list('id', flat=True)
        warehouse_nodes = DistributionPlanNode.objects.filter(item__id__in=item_ids)
        response_nodes = [self.header]
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


class DeliveryExportFactory(object):

    @staticmethod
    def create(type_str):
        return eval(type_str + 'DeliveryExport')()


class WarehouseDeliveryExport(DeliveryCSVExport):

    def __init__(self):
        self.export_header = 'Waybill'
        self.export_label = 'Warehouse'
        self.export_filename = 'warehouse_deliveries.csv'
        self.item_class = ReleaseOrderItem
        super(WarehouseDeliveryExport, self).__init__()


class DirectDeliveryExport(DeliveryCSVExport):

    def __init__(self):
        self.export_header = 'Purchase Order Number'
        self.export_label = 'Direct'
        self.export_filename = 'direct_deliveries.csv'
        self.item_class = PurchaseOrderItem
        super(DirectDeliveryExport, self).__init__()
