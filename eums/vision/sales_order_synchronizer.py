from decimal import Decimal

from django.core.exceptions import ObjectDoesNotExist

from eums.models import SalesOrder, Programme, Item, SalesOrderItem
from eums.settings import VISION_URL
from eums.vision.order_synchronizer import OrderSynchronizer
from eums.vision.vision_data_synchronizer import VisionException


class SalesOrderSynchronizer(OrderSynchronizer):
    SALES_ORDER_URL = VISION_URL + 'GetSalesOrderInfo_JSON/'
    REQUIRED_KEYS = ('SALES_ORDER_NO', 'MATERIAL_CODE', 'SO_ITEM_DESC',
                     'UPDATE_DATE', 'NET_VALUE', 'WBS_REFERENCE', 'SO_ITEM_NO')
    ORDER_INFO = ('SALES_ORDER_NO', 'WBS_REFERENCE', 'UPDATE_DATE')

    def __init__(self, start_date, end_date=''):
        super(SalesOrderSynchronizer, self).__init__(SalesOrderSynchronizer.SALES_ORDER_URL, start_date, end_date,
                                                     SalesOrderSynchronizer.ORDER_INFO)

    def _filter_records(self, records):
        def is_valid_record(record):
            digit_fields = ('SALES_ORDER_NO',)
            for key in SalesOrderSynchronizer.REQUIRED_KEYS:
                if not (record[key] and OrderSynchronizer._is_all_digit(digit_fields, key, record)):
                    return False
            return True

        return filter(is_valid_record, records)

    def _get_or_create_order(self, record):
        order_number = record['SALES_ORDER_NO']
        try:
            return SalesOrder.objects.get(order_number=order_number)
        except ObjectDoesNotExist:
            programme, _ = Programme.objects.get_or_create(wbs_element_ex=record['WBS_REFERENCE'])
            return SalesOrder.objects.create(order_number=order_number,
                                             programme=programme,
                                             date=record['UPDATE_DATE'])
        except Exception, e:
            raise VisionException(message='Get or create sales order error: ' + e.message)

    def _update_or_create_item(self, record, order):
        order_date = record['UPDATE_DATE']
        # There is no quantity info in the sales order records downloaded from web service
        quantity = 0
        net_value = Decimal(record['NET_VALUE'])
        net_price = net_value / quantity if quantity else 0
        item, _ = Item.objects.get_or_create(material_code=record['MATERIAL_CODE'],
                                             description=record['SO_ITEM_DESC'])
        try:
            sales_order_item = SalesOrderItem.objects.get(sales_order=order,
                                                          item=item,
                                                          item_number=record['SO_ITEM_NO'])
            return self._update_item(sales_order_item, order_date, quantity, net_value, net_price)
        except ObjectDoesNotExist:
            return SalesOrderItem.objects.create(sales_order=order,
                                                 item=item,
                                                 item_number=record['SO_ITEM_NO'],
                                                 description=record['SO_ITEM_DESC'],
                                                 quantity=quantity,
                                                 issue_date=order_date,
                                                 delivery_date=order_date,
                                                 net_value=net_value,
                                                 net_price=net_price)
        except Exception, e:
            raise VisionException(message='Update or create sales order item error: ' + e.message)

    @staticmethod
    def _update_item(item, order_date, quantity, net_value, net_price):
        item.issue_date = order_date
        item.delivery_date = order_date
        item.quantity = quantity
        item.net_value = net_value
        item.net_price = net_price
        item.save()
        return item
