from django.test import TestCase

from eums.elasticsearch.serialisers import serialise_nodes
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.delivery_factory import DeliveryFactory
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory
from eums.test.factories.programme_factory import ProgrammeFactory
from eums.test.factories.purchase_order_factory import PurchaseOrderFactory
from eums.test.factories.purchase_order_item_factory import PurchaseOrderItemFactory
from eums.test.factories.release_order_factory import ReleaseOrderFactory
from eums.test.factories.release_order_item_factory import ReleaseOrderItemFactory


class TestDeliveryNodeSerialisation(TestCase):
    def test_should_add_elasticsearch_meta_data_for_every_node(self):
        node = DeliveryNodeFactory()
        expected_es_meta_data = {'index': {'_index': 'eums', '_type': 'delivery_node', '_id': node.id}}

        serialised = serialise_nodes([node])
        self.assertDictEqual(expected_es_meta_data, serialised[0])

    def test_should_serialise_node_flat_fields(self):
        node = DeliveryNodeFactory()
        expected_node_serialisation = {
            "total_value": node.total_value,
            "track": node.track,
            "ip_id": node.ip.id,
            "tree_position": node.tree_position,
            "contact_person_id": node.contact_person_id,
            "item_id": node.item.id,
            "id": node.id,
            "remark": node.remark,
            "consignee_id": node.consignee.id,
            "acknowledged": node.acknowledged,
            "programme_id": node.programme.id,
            "location": node.location,
            "balance": node.balance,
            "distribution_plan_id": node.distribution_plan.id,
            "delivery_date": node.delivery_date
        }

        serialised = serialise_nodes([node])
        self.assertDictContainsSubset(expected_node_serialisation, serialised[1])

    def test_should_serialise_node_with_built_out_consignee(self):
        consignee = ConsigneeFactory()
        node = DeliveryNodeFactory(consignee=consignee)

        expected_consignee_serialisation = {
            "created_by_user_id": consignee.created_by_user.id,
            "name": consignee.name,
            "imported_from_vision": consignee.imported_from_vision,
            "location": consignee.location,
            "remarks": consignee.remarks,
            "customer_id": consignee.customer_id,
            "type": consignee.type,
            "id": consignee.id
        }

        serialised = serialise_nodes([node])
        self.assertDictContainsSubset(expected_consignee_serialisation, serialised[1]['consignee'])

    def test_should_serialise_node_with_built_out_implementing_partner(self):
        ip = ConsigneeFactory()
        node = DeliveryNodeFactory(consignee=ip)

        expected_ip_serialisation = {
            "created_by_user_id": ip.created_by_user.id,
            "name": ip.name,
            "imported_from_vision": ip.imported_from_vision,
            "location": ip.location,
            "remarks": ip.remarks,
            "customer_id": ip.customer_id,
            "type": ip.type,
            "id": ip.id
        }

        serialised = serialise_nodes([node])
        self.assertDictContainsSubset(expected_ip_serialisation, serialised[1]['ip'])

    def test_should_serialise_node_with_built_out_programme(self):
        programme = ProgrammeFactory()
        delivery = DeliveryFactory(programme=programme)
        node = DeliveryNodeFactory(distribution_plan=delivery)

        expected_programme_serialisation = {
            "wbs_element_ex": programme.wbs_element_ex,
            "id": programme.id,
            "name": programme.name
        }

        serialised = serialise_nodes([node])
        self.assertDictContainsSubset(expected_programme_serialisation, serialised[1]['programme'])

    def test_should_serialise_node_release_order_item_with_flat_fields(self):
        release_order_item = ReleaseOrderItemFactory()
        node = DeliveryNodeFactory(item=release_order_item)

        expected = {
            "item_number": release_order_item.item_number,
            "value": release_order_item.value,
            "purchase_order_item_id": release_order_item.purchase_order_item.id,
            "item_id": release_order_item.item.id,
            "release_order_id": release_order_item.release_order.id,
            "id": release_order_item.id,
            "quantity": release_order_item.quantity
        }

        serialised = serialise_nodes([node])
        self.assertDictContainsSubset(expected, serialised[1]['order_item'])

    def test_should_serialise_node_release_order(self):
        release_order = ReleaseOrderFactory()
        node = DeliveryNodeFactory(item=(ReleaseOrderItemFactory(release_order=release_order)))

        expected = {
            "consignee_id": release_order.consignee.id,
            "sales_order_id": release_order.sales_order.id,
            "purchase_order_id": release_order.purchase_order.id,
            "waybill": release_order.waybill,
            "order_type": "release_order",
            "order_number": release_order.order_number,
            "id": release_order.id,
            "delivery_date": release_order.delivery_date
        }

        serialised = serialise_nodes([node])
        self.assertDictContainsSubset(expected, serialised[1]['order_item']['order'])

    def test_should_serialise_node_purchase_order_item_with_flat_fields(self):
        purchase_order_item = PurchaseOrderItemFactory()
        node = DeliveryNodeFactory(item=purchase_order_item)

        expected = {
            "item_number": purchase_order_item.item_number,
            "value": purchase_order_item.value,
            "item_id": purchase_order_item.item.id,
            "sales_order_item_id": purchase_order_item.sales_order_item.id,
            "purchase_order_id": purchase_order_item.purchase_order.id,
            "id": purchase_order_item.id,
            "quantity": purchase_order_item.quantity
        }

        serialised = serialise_nodes([node])
        self.assertDictContainsSubset(expected, serialised[1]['order_item'])

    def test_should_serialise_node_purchase_order(self):
        purchase_order = PurchaseOrderFactory()
        node = DeliveryNodeFactory(item=(PurchaseOrderItemFactory(purchase_order=purchase_order)))

        expected = {
            "po_type": purchase_order.po_type,
            "order_number": purchase_order.order_number,
            "date": purchase_order.date,
            "sales_order_id": purchase_order.sales_order.id,
            "id": purchase_order.id,
            "is_single_ip": purchase_order.is_single_ip,
            "order_type": "purchase_order",
        }

        serialised = serialise_nodes([node])
        self.assertDictContainsSubset(expected, serialised[1]['order_item']['order'])
