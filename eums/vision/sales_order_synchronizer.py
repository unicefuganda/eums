import re
from decimal import Decimal

from eums.models import Item, SalesOrderItem, SalesOrder, Programme
from eums.settings import VISION_URL
from eums.vision.order_synchronizer import OrderSynchronizer
from eums.vision.vision_data_synchronizer import VisionDataSynchronizer


class SalesOrderSynchronizer(OrderSynchronizer):
    SALES_ORDER_URL = VISION_URL + 'GetSalesOrderInfo_JSON/'
    MAPPING_TEMPLATE = {'SALES_ORDER_NO': 'order_number',
                        'MATERIAL_CODE': 'material_code',
                        'SO_ITEM_DESC': 'item_description',
                        'DOCUMENT_DATE': 'date',
                        'NET_VALUE': 'net_value',
                        'WBS_REFERENCE': 'programme_wbs_element',
                        'SO_ITEM_NO': 'item_number'}

    def __init__(self, start_date, end_date=''):
        kwargs = {'mapping_template': SalesOrderSynchronizer.MAPPING_TEMPLATE,
                  'base_url': SalesOrderSynchronizer.SALES_ORDER_URL,
                  'start_date': start_date,
                  'end_date': end_date}
        super(SalesOrderSynchronizer, self).__init__(**kwargs)

    def _get_or_create_new_order(self, order):
        order_number = order['order_number']
        matching_sales_orders = SalesOrder.objects.filter(order_number=order_number)

        if len(matching_sales_orders):
            return matching_sales_orders[0]

        wbs_code = self._convert_wbs_code_format(order['programme_wbs_element'])
        programme, created = Programme.objects.get_or_create(wbs_element_ex=wbs_code)
        return SalesOrder.objects.create(order_number=order_number, programme=programme,
                                         date=VisionDataSynchronizer._convert_date_format(order['items'][0]['date']))

    def _update_or_create_new_item(self, sales_order_item, order):
        item, created = Item.objects.get_or_create(material_code=sales_order_item['material_code'],
                                                   description=sales_order_item['item_description'])

        order_date = VisionDataSynchronizer._convert_date_format(sales_order_item['date'])
        # There is no quantity info in the sales order records downloaded from web service
        quantity = 0
        net_value = Decimal(sales_order_item['net_value'])
        net_price = net_value / quantity if quantity else 0

        matching_items = SalesOrderItem.objects.filter(sales_order=order,
                                                       item=item,
                                                       item_number=sales_order_item['item_number'])

        if len(matching_items):
            return self._update_order_item(matching_items[0], order_date, quantity, net_value, net_price)

        return SalesOrderItem.objects.get_or_create(sales_order=order,
                                                    item=item,
                                                    item_number=sales_order_item['item_number'],
                                                    description=sales_order_item['item_description'],
                                                    quantity=quantity,
                                                    issue_date=order_date,
                                                    delivery_date=order_date,
                                                    net_value=net_value,
                                                    net_price=net_price)

    def _append_new_order(self, record, order_number, orders):
        sales_order_program_wbs = record['programme_wbs_element']
        self._remove_order_level_data_from(record)
        orders.append({'order_number': order_number,
                       'programme_wbs_element': sales_order_program_wbs,
                       'items': [record]})

    def _append_new_item(self, record, order_index, orders):
        self._remove_order_level_data_from(record)
        orders[order_index].get('items').append(record)

    @staticmethod
    def _convert_wbs_code_format(wbs_code):
        wbs_code_without_suffix = ''
        if len(wbs_code) == 17:
            wbs_code_without_suffix = wbs_code[0:-6]

        if len(wbs_code) == 11:
            wbs_code_without_suffix = wbs_code

        return re.sub(r'(.{4})(.{2})(.{2})', r'\1/\2/\3/', wbs_code_without_suffix) if wbs_code_without_suffix else ''

    @staticmethod
    def _remove_order_level_data_from(record):
        del record['order_number']
        del record['programme_wbs_element']

    @staticmethod
    def _update_order_item(matching_item, order_date, quantity, net_value, net_price):
        matching_item.issue_date = order_date
        matching_item.delivery_date = order_date
        matching_item.quantity = quantity
        matching_item.net_value = net_value
        matching_item.net_price = net_price
        matching_item.save()
        return matching_item
