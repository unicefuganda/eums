from eums.models import ReleaseOrderItem, PurchaseOrderItem, DistributionPlanNode
from eums.services.abstract_csv_exporter import AbstractCSVExporter


class DeliveryCSVExport(AbstractCSVExporter):
    END_USER_RESPONSE = {True: 'Yes', False: 'No'}
    COMMON_HEADER = ['Item Description', 'Material Code', 'Quantity Shipped', 'Shipment Date',
                     'Implementing Partner', 'Contact Person', 'Contact Number', 'District', 'Is End User',
                     'Is Tracked', 'Remarks']

    def _init_header(self):
        return self.COMMON_HEADER

    def assemble_csv_data(self, data=None):
        item_ids = self.item_class.objects.values_list('id', flat=True)
        nodes = DistributionPlanNode.objects.filter(item__id__in=item_ids)
        response_nodes = [self.header]
        for node in nodes:
            response_nodes.append(self.__export_data(node))
        return response_nodes

    def __export_data(self, node):
        contact = node.contact
        is_end_user = self.END_USER_RESPONSE[node.is_end_user()]
        is_tracked = self.END_USER_RESPONSE[node.track]
        return [node.number(), node.item_description(), node.item.item.material_code, node.quantity_in(),
                node.delivery_date.isoformat(), node.ip.name, contact.full_name(), contact.phone,
                node.location, is_end_user, is_tracked, node.remark]

    @staticmethod
    def make_delivery_export_by_type(type_str, host_name):
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
