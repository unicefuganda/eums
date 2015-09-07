from eums.models import DistributionPlanNode, ReleaseOrderItem
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_csv.renderers import CSVRenderer

END_USER_RESPONSE = {True: 'Yes', False: 'No'}


class WarehouseDeliveriesCSV(APIView):
    renderer_classes = (CSVRenderer,)

    def get(self, request, *args, **kwargs):
        release_order_item_ids = ReleaseOrderItem.objects.values_list('id', flat=True);
        warehouse_nodes = DistributionPlanNode.objects.filter(item__id__in=release_order_item_ids)
        response_nodes = []
        for node in warehouse_nodes:
            contact = node.contact
            contact_person = contact.full_name()
            contact_number = contact.phone
            is_end_user = END_USER_RESPONSE[node.is_end_user()]
            is_tracked = END_USER_RESPONSE[node.track]

            response_node = {'Waybill': node.number(), 'Item Description': node.item_description(),
                             'Material Code': node.item.item.material_code, 'Quantity Shipped': node.quantity_in(),
                             'Shipment Date': node.delivery_date.isoformat(), 'Implementing Partner': node.ip.name,
                             'Contact Person': contact_person, 'Contact Number': contact_number,
                             'District': node.location, 'Is End User': is_end_user,
                             'Is Tracked': is_tracked}

            response_nodes.append(response_node)

        return Response(response_nodes)