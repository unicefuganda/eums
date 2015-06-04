from eums.test.factories.item_factory import ItemFactory
from eums.test.factories.sales_order_factory import SalesOrderFactory
from eums.test.api.api_test_helpers import create_item, create_sales_order, create_sales_order_item, create_purchase_order, create_purchase_order_item
from eums.test.api.authenticated_api_test_case import AuthenticatedAPITestCase
from eums.test.config import BACKEND_URL

ENDPOINT_URL = BACKEND_URL + 'sales-order-item/'
PO_ITEM_FOR_SO_ITEM_ENDPOINT_URL = BACKEND_URL + 'so-item-po-item/'


class SalesOrderItemEndPointTest(AuthenticatedAPITestCase):
    def test_should_create_sales_order(self):
        item = ItemFactory()
        sales_order = SalesOrderFactory()

        sales_order_item_details = {'sales_order': sales_order.id, 'item': item.id, 'quantity': 23,
                               'net_price': 12000.0, 'net_value': 100.0, 'issue_date': '2014-01-21',
                               'delivery_date': '2014-01-21', 'item_number': 10}

        created_sales_order_item = create_sales_order_item(self, sales_order_item_details)

        self.assertDictContainsSubset(sales_order_item_details, created_sales_order_item)
        self.assertDictContainsSubset({'distributionplannode_set': []}, created_sales_order_item)


class POItemForSOItemEndPointTest(AuthenticatedAPITestCase):
    def test_should_get_po_item_for_so_item(self):
        item = create_item(self)
        sales_order = create_sales_order(self)
        sales_order_details = {'sales_order': sales_order['id'], 'item': item['id'], 'quantity': 23,
                               'net_price': 12000.0, 'net_value': 100.0, 'issue_date': '2014-01-21',
                               'delivery_date': '2014-01-21', 'item_number': 10}
        created_sales_order_item = create_sales_order_item(self, sales_order_details)

        purchase_order_details = { 'order_number': 20156023, 'date': '2014-11-07',
                                   'sales_order': sales_order['id'], 'programme': sales_order['programme']
                                 }
        created_purchase_order = create_purchase_order(self, purchase_order_details)

        purchase_order_item_details = { 'purchase_order': created_purchase_order['id'], 'item_number': item['id'],
                                        'quantity': 12000, 'value': 100.0, 'sales_order_item': created_sales_order_item['id']
                                      }
        created_purchase_order_item = create_purchase_order_item(self, purchase_order_item_details)

        po_details = {u'id': created_purchase_order['id'], 'order_number': created_purchase_order['order_number'],
                      'date': created_purchase_order['date'], 'sales_order': sales_order['id']}
        po_item_details = { u'id': created_purchase_order_item['id'], 'item_number': item['id'],
            'purchase_order': po_details, 'sales_order_item': created_sales_order_item['id'],
            'quantity': 12000, 'value': 100.0
        }

        get_response = self.client.get(PO_ITEM_FOR_SO_ITEM_ENDPOINT_URL + str(created_sales_order_item['id'])+'/')

        self.assertEqual(get_response.status_code, 200)
        self.assertEqual(po_item_details, get_response.data)
