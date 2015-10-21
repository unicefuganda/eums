from eums.elasticsearch.serialisers import serialise_nodes
from eums.test.elasticsearch.serialisation_tests.serialisation_test_case import SerialisationTestCase
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory
from eums.test.factories.item_factory import ItemFactory
from eums.test.factories.purchase_order_factory import PurchaseOrderFactory
from eums.test.factories.purchase_order_item_factory import PurchaseOrderItemFactory
from eums.test.factories.release_order_factory import ReleaseOrderFactory
from eums.test.factories.release_order_item_factory import ReleaseOrderItemFactory
from eums.test.factories.sales_order_factory import SalesOrderFactory


class TestOrderDataSerialisation(SerialisationTestCase):
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

    def test_should_serialise_node_sales_order_under_order(self):
        sales_order = SalesOrderFactory()
        release_order = ReleaseOrderFactory(sales_order=sales_order)
        node = DeliveryNodeFactory(item=(ReleaseOrderItemFactory(release_order=release_order)))

        expected = {
            "programme_id": sales_order.programme.id,
            "description": sales_order.description,
            "date": sales_order.date,
            "order_number": sales_order.order_number,
            "id": sales_order.id
        }

        serialised = serialise_nodes([node])
        self.assertDictContainsSubset(expected, serialised[1]['order_item']['order']['sales_order'])

    def test_should_serialise_node_purchase_order_under_release_order(self):
        purchase_order = PurchaseOrderFactory()
        release_order = ReleaseOrderFactory(purchase_order=purchase_order)
        node = DeliveryNodeFactory(item=(ReleaseOrderItemFactory(release_order=release_order)))

        expected = {
            "po_type": purchase_order.po_type,
            "order_number": purchase_order.order_number,
            "date": purchase_order.date,
            "sales_order_id": purchase_order.sales_order.id,
            "id": purchase_order.id,
            "is_single_ip": purchase_order.is_single_ip
        }

        serialised = serialise_nodes([node])
        self.assertDictContainsSubset(expected, serialised[1]['order_item']['order']['purchase_order'])

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

    def test_should_serialise_item_under_node_order_item(self):
        item = ItemFactory()
        node = DeliveryNodeFactory(item=PurchaseOrderItemFactory(item=item))

        expected = {
            "description": item.description,
            "material_code": item.material_code,
            "unit_id": item.unit.id,
            "id": item.id,
            "unit": item.unit.name
        }

        serialised = serialise_nodes([node])
        self.assertDictContainsSubset(expected, serialised[1]['order_item']['item'])
