from eums.models import DistributionPlanNode
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_csv.renderers import CSVRenderer


class WarehouseDeliveriesCSV(APIView):
    renderer_classes = (CSVRenderer,)

    def get(self, request, *args, **kwargs):
        warehouse_nodes = filter(lambda node: node.type() == 'Waybill', DistributionPlanNode.objects.all())
        response_nodes = []
        for node in warehouse_nodes:
            contact = node.build_contact()
            if contact:
                contact_person = '%s %s' % (contact['firstName'], contact['lastName'])
                contact_number = contact['phone']
            else:
                contact_person = ''
                contact_number = ''

            yes = 'Yes'
            no = 'No'
            is_end_user = yes if node.tree_position == DistributionPlanNode.END_USER else no

            response_node = {'Waybill': node.number(), 'Item Description': node.item_description(),
                             'Material Code': node.item.item.material_code, 'Quantity Shipped': node.quantity_in(),
                             'Shipment Date': node.delivery_date.isoformat(), 'Implementing Partner': node.ip.name,
                             'Contact Person': contact_person, 'Contact Number': contact_number,
                             'District': node.location, 'Is End User': is_end_user,
                             'Is Tracked': yes if node.track else no}

            response_nodes.append(response_node)

        return Response(response_nodes)

