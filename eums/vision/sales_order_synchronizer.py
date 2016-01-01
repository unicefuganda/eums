from decimal import Decimal
from itertools import groupby
from operator import itemgetter

from eums.models import SalesOrder, Programme, Item, SalesOrderItem
from eums.settings import VISION_URL
from eums.vision.order_synchronizer import OrderSynchronizer


class SalesOrderSynchronizer(OrderSynchronizer):
    SALES_ORDER_URL = VISION_URL + 'GetSalesOrderInfo_JSON/'
    REQUIRED_KEYS = ('SALES_ORDER_NO', 'MATERIAL_CODE', 'SO_ITEM_DESC',
                     'CREATE_DATE', 'NET_VALUE', 'WBS_REFERENCE', 'SO_ITEM_NO')

    def __init__(self, start_date, end_date=''):
        super(SalesOrderSynchronizer, self).__init__(SalesOrderSynchronizer.SALES_ORDER_URL, start_date, end_date)

    def _get_or_create_order(self, record):
        order_number = record['SALES_ORDER_NO']
        matching_sales_orders = SalesOrder.objects.filter(order_number=order_number)
        if matching_sales_orders:
            return matching_sales_orders[0]

        programme, _ = Programme.objects.get_or_create(wbs_element_ex=record['WBS_REFERENCE'])
        return SalesOrder.objects.create(order_number=order_number,
                                         programme=programme,
                                         date=record['CREATE_DATE'])

    def _update_or_create_item(self, record, order):
        item, _ = Item.objects.get_or_create(material_code=record['MATERIAL_CODE'],
                                             description=record['SO_ITEM_DESC'])

        matching_items = SalesOrderItem.objects.filter(sales_order=order,
                                                       item=item,
                                                       item_number=record['SO_ITEM_NO'])

        order_date = record['CREATE_DATE']
        # There is no quantity info in the sales order records downloaded from web service
        quantity = 0
        net_value = Decimal(record['NET_VALUE'])
        net_price = net_value / quantity if quantity else 0

        if matching_items:
            return self._update_item(matching_items[0], order_date, quantity, net_value, net_price)

        return SalesOrderItem.objects.create(sales_order=order,
                                             item=item,
                                             item_number=record['SO_ITEM_NO'],
                                             description=record['SO_ITEM_DESC'],
                                             quantity=quantity,
                                             issue_date=order_date,
                                             delivery_date=order_date,
                                             net_value=net_value,
                                             net_price=net_price)

    @staticmethod
    def _update_item(item, order_date, quantity, net_value, net_price):
        item.issue_date = order_date
        item.delivery_date = order_date
        item.quantity = quantity
        item.net_value = net_value
        item.net_price = net_price
        item.save()
        return item

    @staticmethod
    def _filter_records(records):
        def is_valid_record(record):
            for key in SalesOrderSynchronizer.REQUIRED_KEYS:
                if not record[key]:
                    return False
            return True

        return filter(is_valid_record, records)

    @staticmethod
    def _format_records(records):
        def _to_dict(record_order, record_items):
            return {'SALES_ORDER_NO': record_order[0],
                    'WBS_REFERENCE': record_order[1],
                    'CREATE_DATE': record_order[2],
                    'ITEMS': list(record_items)}

        return [_to_dict(order, items) for order, items in groupby(records, key=itemgetter('SALES_ORDER_NO',
                                                                                           'WBS_REFERENCE',
                                                                                           'CREATE_DATE'))]
