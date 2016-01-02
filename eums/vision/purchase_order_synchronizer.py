from itertools import groupby
from operator import itemgetter

from eums.models import PurchaseOrder, SalesOrder, PurchaseOrderItem, Item
from eums.settings import VISION_URL
from eums.vision.order_synchronizer import OrderSynchronizer


class PurchaseOrderSynchronizer(OrderSynchronizer):
    PURCHASE_ORDER_URL = VISION_URL + 'GetPurchaseOrderInfo_JSON/'
    REQUIRED_KEYS = ('PO_NUMBER', 'PO_ITEM', 'PO_TYPE', 'MATERIAL_CODE', 'MATERIAL_DESC', 'AMOUNT_USD',
                     'PO_ITEM_QTY', 'SO_NUMBER', 'PREQ_ITEM', 'UPDATE_DATE')
    SUPPORTED_PO_TYPE = ['NB', 'ZLC', 'ZUB', 'ZOC']

    def __init__(self, start_date, end_date=''):
        super(PurchaseOrderSynchronizer, self).__init__(PurchaseOrderSynchronizer.PURCHASE_ORDER_URL, start_date,
                                                        end_date)

    def _get_or_create_order(self, record):
        matching_purchase_orders = PurchaseOrder.objects.filter(order_number=record['PO_NUMBER'])
        if matching_purchase_orders:
            return self._update_order(matching_purchase_orders[0], record['UPDATE_DATE'], record['PO_TYPE'])

        matching_sales_orders = SalesOrder.objects.filter(order_number=record['SO_NUMBER'])
        if matching_sales_orders:
            return PurchaseOrder.objects.create(order_number=record['PO_NUMBER'],
                                                sales_order=matching_sales_orders[0],
                                                date=record['UPDATE_DATE'],
                                                po_type=record['PO_TYPE'])

    def _update_or_create_item(self, record, order):
        matching_sales_order_items = order.sales_order.salesorderitem_set.filter(item_number=record['PREQ_ITEM'])
        matching_sales_order_item = matching_sales_order_items[0] if matching_sales_order_items else None
        matching_po_items = PurchaseOrderItem.objects.filter(purchase_order__order_number=order.order_number,
                                                             item_number=record['PO_ITEM'],
                                                             sales_order_item=matching_sales_order_item)

        if not matching_po_items:
            item, _ = Item.objects.get_or_create(material_code=record['MATERIAL_CODE'],
                                                 description=record['MATERIAL_DESC'])
            PurchaseOrderItem.objects.get_or_create(purchase_order=order,
                                                    item=item,
                                                    item_number=record['PO_ITEM'],
                                                    sales_order_item=matching_sales_order_item,
                                                    quantity=record['PO_ITEM_QTY'],
                                                    value=record['AMOUNT_USD'])
        else:
            return self._update_order_item(matching_po_items[0],
                                           record['PO_ITEM_QTY'],
                                           record['AMOUNT_USD'])

    @staticmethod
    def _update_order(order, po_date, po_type):
        order.date = po_date
        order.po_type = po_type
        order.save()
        return order

    @staticmethod
    def _update_order_item(item, quantity, value):
        item.quantity = quantity
        item.value = value
        item.save()
        return item

    @staticmethod
    def _filter_records(records):
        def is_valid_record(record):
            for key in PurchaseOrderSynchronizer.REQUIRED_KEYS:
                if not record[key] \
                        or key == 'PO_TYPE' and not record[key] in PurchaseOrderSynchronizer.SUPPORTED_PO_TYPE:
                    return False
            return True

        return filter(is_valid_record, records)

    @staticmethod
    def _format_records(records):
        def _to_dict(record_order, record_items):
            return {'PO_NUMBER': record_order[0],
                    'SO_NUMBER': record_order[1],
                    'PO_TYPE': record_order[2],
                    'UPDATE_DATE': record_order[3],
                    'ITEMS': list(record_items)}

        return [_to_dict(order, items) for order, items in groupby(records, key=itemgetter('PO_NUMBER',
                                                                                           'SO_NUMBER',
                                                                                           'PO_TYPE',
                                                                                           'UPDATE_DATE'))]
