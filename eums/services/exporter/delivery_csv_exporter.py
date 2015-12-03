import copy
from eums.models import ReleaseOrderItem, PurchaseOrderItem, DistributionPlanNode
from eums.services.exporter.abstract_csv_exporter import AbstractCSVExporter


class DeliveryCSVExporter(AbstractCSVExporter):
    END_USER_RESPONSE = {True: 'Yes', False: 'No'}
    COMMON_HEADER = ['Item Description', 'Material Code', 'Quantity Shipped', 'Shipment Date',
                     'Implementing Partner', 'Contact Person', 'Contact Number', 'District', 'Is End User',
                     'Is Tracked', 'Remarks']

    def __init__(self, host_name):
        self.export_category = 'delivery'
        super(DeliveryCSVExporter, self).__init__(host_name)

    def assemble_csv_data(self, data=None):
        item_ids = self.item_class.objects.values_list('id', flat=True)
        nodes = DistributionPlanNode.objects.filter(item__id__in=item_ids)
        total_rows = [self._init_header()]
        for node in nodes:
            total_rows.append(self.__export_row_data(node))
        return total_rows

    def __export_row_data(self, node):
        contact = node.contact
        is_end_user = self.END_USER_RESPONSE[node.is_end_user()]
        is_tracked = self.END_USER_RESPONSE[node.track]
        return [node.number(), node.item_description(), node.item.item.material_code, node.quantity_in(),
                node.delivery_date.isoformat(), node.ip.name, contact.full_name(), contact.phone,
                node.location, is_end_user, is_tracked, node.remark]

    @staticmethod
    def create_delivery_exporter_by_type(type_str, host_name):
        return eval(type_str + 'DeliveryExporter')(host_name)


class WarehouseDeliveryExporter(DeliveryCSVExporter):
    def __init__(self, host_name):
        self.export_label = 'Warehouse Delivery'
        self.export_header = 'Waybill'
        self.file_name = 'warehouse_deliveries'
        self.item_class = ReleaseOrderItem
        super(WarehouseDeliveryExporter, self).__init__(host_name)

    def _init_header(self):
        header = self.COMMON_HEADER[:]
        header.insert(0, 'Waybill')
        return header


class DirectDeliveryExporter(DeliveryCSVExporter):
    def __init__(self, host_name):
        self.export_label = 'Direct Delivery'
        self.file_name = 'direct_deliveries'
        self.item_class = PurchaseOrderItem
        super(DirectDeliveryExporter, self).__init__(host_name)

    def _init_header(self):
        header = self.COMMON_HEADER[:]
        header.insert(0, 'Purchase Order')
        return header
