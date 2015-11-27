from django.conf import settings
from eums.models import ReleaseOrderItem, DistributionPlanNode, PurchaseOrderItem


class DeliveryCSVExport(object):
    END_USER_RESPONSE = {True: 'Yes', False: 'No'}
    COMMON_HEADER = ['Item Description', 'Material Code', 'Quantity Shipped', 'Shipment Date',
                     'Implementing Partner', 'Contact Person', 'Contact Number', 'District', 'Is End User',
                     'Is Tracked', 'Remarks']

    def __init__(self, host_name):
        self.header = self._set_export_header()
        self.csv_url = self._set_csv_url(host_name)

    def _set_csv_url(self, host_name):
        return '%sstatic/exports/%s' % (host_name, self.export_filename)

    def _set_export_header(self):
        header = [self.export_header]
        header.extend(self.COMMON_HEADER)
        return header

    def _message(self):
        return settings.EMAIL_NOTIFICATION_CONTENT.format(self.export_label, self.csv_url)

    def _subject(self):
        return "%s Delivery Download" % self.export_label

    def notification_details(self):
        return self._subject(), self._message()

    def data(self):
        item_ids = self.item_class.objects.values_list('id', flat=True)
        nodes = DistributionPlanNode.objects.filter(item__id__in=item_ids)
        response_nodes = [self.header]
        for node in nodes:
            response_nodes.append(self._export_data(node))
        return response_nodes

    def _export_data(self, node):
        contact = node.contact
        is_end_user = self.END_USER_RESPONSE[node.is_end_user()]
        is_tracked = self.END_USER_RESPONSE[node.track]

        return [node.number(), node.item_description(), node.item.item.material_code, node.quantity_in(),
                node.delivery_date.isoformat(), node.ip.name, contact.full_name(), contact.phone,
                node.location, is_end_user, is_tracked, node.remark]


class DeliveryExportFactory(object):
    @staticmethod
    def create(type_str, host_name):
        return eval(type_str + 'DeliveryExport')(host_name)


class WarehouseDeliveryExport(DeliveryCSVExport):
    def __init__(self, host_name):
        self.export_header = 'Waybill'
        self.export_label = 'Warehouse'
        self.export_filename = 'warehouse_deliveries.csv'
        self.item_class = ReleaseOrderItem
        super(WarehouseDeliveryExport, self).__init__(host_name)


class DirectDeliveryExport(DeliveryCSVExport):
    def __init__(self, host_name):
        self.export_header = 'Purchase Order Number'
        self.export_label = 'Direct'
        self.export_filename = 'direct_deliveries.csv'
        self.item_class = PurchaseOrderItem
        super(DirectDeliveryExport, self).__init__(host_name)
