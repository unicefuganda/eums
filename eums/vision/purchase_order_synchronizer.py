from eums.models import PurchaseOrderItem, Item, SalesOrder, PurchaseOrder
from eums.settings import VISION_URL
from eums.vision.order_synchronizer import OrderSynchronizer


class PurchaseOrderSynchronizer(OrderSynchronizer):
    PURCHASE_ORDER_URL = VISION_URL + 'GetPurchaseOrderInfo_JSON/'
    MAPPING_TEMPLATE = {'PO_NUMBER': 'order_number',
                        'PO_ITEM': 'po_item_number',
                        'PO_TYPE': 'po_type',
                        'MATERIAL_CODE': 'material_code',
                        'MATERIAL_DESC': 'material_description',
                        'AMOUNT_USD': 'value',
                        'PO_ITEM_QTY': 'quantity',
                        'SO_NUMBER': 'so_number',
                        'PREQ_ITEM': 'so_item_number',
                        'PO_DATE': 'po_date'}
    SUPPORTED_PO_TYPE = ['NB', 'ZLC', 'ZUB', 'ZOC']

    def __init__(self, start_date, end_date=''):
        kwargs = {'mapping_template': PurchaseOrderSynchronizer.MAPPING_TEMPLATE,
                  'base_url': PurchaseOrderSynchronizer.PURCHASE_ORDER_URL,
                  'start_date': start_date,
                  'end_date': end_date}
        super(PurchaseOrderSynchronizer, self).__init__(**kwargs)

    @staticmethod
    def _remove_order_level_data_from(record):
        del record['order_number']
        del record['so_number']
        del record['po_date']
        del record['po_type']

    @staticmethod
    def _get_matching_sales_order(order):
        if not isinstance(order['so_number'], basestring):
            return SalesOrder.objects.filter(order_number=order['so_number'])
        return []

    @staticmethod
    def _update_order(matching_order, po_date, po_type):
        matching_order.date = po_date
        matching_order.po_type = po_type
        matching_order.save()
        return matching_order

    @staticmethod
    def _update_order_item(matching_item, quantity, value):
        matching_item.quantity = quantity
        matching_item.value = value
        matching_item.save()
        return matching_item

    def _get_or_create_new_order(self, order):
        matching_purchase_orders = PurchaseOrder.objects.filter(order_number=order['order_number'])
        po_date = None if order['po_date'] == '' else self._convert_date_format(order['po_date'])

        if len(matching_purchase_orders):
            return self._update_order(matching_purchase_orders[0], po_date, order['po_type'])

        if order['po_type'] not in self.SUPPORTED_PO_TYPE:
            return None

        matching_sales_orders = self._get_matching_sales_order(order)

        if len(matching_sales_orders):
            return PurchaseOrder.objects.create(order_number=order['order_number'],
                                                sales_order=matching_sales_orders[0],
                                                date=po_date,
                                                po_type=order['po_type'])

    def _update_or_create_new_item(self, purchase_order_item, order):
        matching_sales_order_items = order.sales_order.salesorderitem_set.filter(
            item_number=purchase_order_item['so_item_number'])

        matching_sales_order_item = matching_sales_order_items[0] if len(matching_sales_order_items) else None
        matching_po_items = PurchaseOrderItem.objects.filter(purchase_order__order_number=order.order_number,
                                                             item_number=purchase_order_item['po_item_number'],
                                                             sales_order_item=matching_sales_order_item)

        if not len(matching_po_items):
            item, _ = Item.objects.get_or_create(material_code=purchase_order_item['material_code'],
                                                 description=purchase_order_item['material_description'])
            PurchaseOrderItem.objects.get_or_create(purchase_order=order,
                                                    item=item,
                                                    item_number=purchase_order_item['po_item_number'],
                                                    sales_order_item=matching_sales_order_item,
                                                    quantity=float(purchase_order_item['quantity']),
                                                    value=float(purchase_order_item['value']))
        else:
            return self._update_order_item(matching_po_items[0],
                                           float(purchase_order_item['quantity']),
                                           float(purchase_order_item['value']))

    def _append_new_order(self, record, order_number, orders):
        sales_order = record['so_number']
        po_date = record['po_date']
        po_type = record['po_type']
        self._remove_order_level_data_from(record)
        orders.append({'so_number': sales_order, 'order_number': order_number,
                       'po_date': po_date, 'po_type': po_type, 'items': [record]})

    def _append_new_item(self, record, order_index, orders):
        self._remove_order_level_data_from(record)
        orders[order_index].get('items').append(record)
