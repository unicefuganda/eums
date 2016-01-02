from itertools import groupby
from operator import itemgetter

from eums.models import ReleaseOrder, Consignee, PurchaseOrderItem, ReleaseOrderItem, Item, SalesOrder, PurchaseOrder
from eums.settings import VISION_URL
from eums.vision.order_synchronizer import OrderSynchronizer


class ReleaseOrderSynchronizer(OrderSynchronizer):
    RELEASE_ORDER_URL = VISION_URL + 'GetReleaseOrderInfo_JSON/'
    REQUIRED_KEYS = ('RELEASE_ORDER_NUMBER', 'RELEASE_ORDER_ITEM', 'SHIPMENT_END_DATE', 'MATERIAL_NUMBER',
                     'DELIVERY_QUANTITY', 'VALUE', 'CONSIGNEE', 'SO_NUMBER', 'PO_NUMBER', 'WAYBILL_NUMBER', 'PO_ITEM')

    def __init__(self, start_date, end_date=''):
        super(ReleaseOrderSynchronizer, self).__init__(ReleaseOrderSynchronizer.RELEASE_ORDER_URL, start_date, end_date)

    def _get_or_create_order(self, record):
        matching_release_orders = ReleaseOrder.objects.filter(order_number=record['RELEASE_ORDER_NUMBER'])
        if matching_release_orders:
            return matching_release_orders[0]

        consignee = self._update_or_create_consignee(record)
        matching_sales_orders = SalesOrder.objects.filter(order_number=record['SO_NUMBER'])
        matching_purchase_orders = PurchaseOrder.objects.filter(order_number=record['PO_NUMBER'])

        if matching_sales_orders and matching_purchase_orders:
            return ReleaseOrder.objects.create(order_number=record['RELEASE_ORDER_NUMBER'],
                                               waybill=record['WAYBILL_NUMBER'],
                                               delivery_date=record['SHIPMENT_END_DATE'],
                                               consignee=consignee,
                                               sales_order=matching_sales_orders[0],
                                               purchase_order=matching_purchase_orders[0])

    def _update_or_create_item(self, record, order):
        matching_purchase_orders = PurchaseOrder.objects.filter(order_number=record['PO_NUMBER'])
        if matching_purchase_orders:
            matching_purchase_order_items = PurchaseOrderItem.objects.filter(purchase_order=matching_purchase_orders[0],
                                                                             item_number=record['PO_ITEM'])

            if matching_purchase_order_items:
                matching_ro_items = ReleaseOrderItem.objects.filter(release_order__order_number=order.order_number,
                                                                    purchase_order_item=matching_purchase_order_items[0])
                if not matching_ro_items:
                    item, _ = Item.objects.get_or_create(id=matching_purchase_order_items[0].item_id)

                    ReleaseOrderItem.objects.create(release_order=order,
                                                    purchase_order_item=matching_purchase_order_items[0],
                                                    item=item,
                                                    item_number=record['RELEASE_ORDER_ITEM'],
                                                    quantity=record['DELIVERY_QUANTITY'],
                                                    value=record['VALUE'])
                else:
                    return self._update_item(matching_ro_items[0],
                                             record['DELIVERY_QUANTITY'],
                                             record['VALUE'])

    @staticmethod
    def _update_or_create_consignee(order):
        consignee, _ = Consignee.objects.get_or_create(customer_id=order['CONSIGNEE'])
        consignee.imported_from_vision = True
        consignee.save()
        return consignee

    @staticmethod
    def _update_item(item, quantity, value):
        item.quantity = quantity
        item.value = value
        item.save()
        return item

    @staticmethod
    def _filter_records(records):
        def is_valid_record(record):
            for key in ReleaseOrderSynchronizer.REQUIRED_KEYS:
                if not record[key]:
                    return False
            return True

        return filter(is_valid_record, records)

    @staticmethod
    def _format_records(records):
        def _to_dict(record_order, record_items):
            return {'RELEASE_ORDER_NUMBER': record_order[0],
                    'WAYBILL_NUMBER': record_order[1],
                    'SO_NUMBER': record_order[2],
                    'PO_NUMBER': record_order[3],
                    'CONSIGNEE': record_order[4],
                    'SHIPMENT_END_DATE': record_order[5],
                    'ITEMS': list(record_items)}

        return [_to_dict(order, items) for order, items in groupby(records, key=itemgetter('RELEASE_ORDER_NUMBER',
                                                                                           'WAYBILL_NUMBER',
                                                                                           'SO_NUMBER',
                                                                                           'PO_NUMBER',
                                                                                           'CONSIGNEE',
                                                                                           'SHIPMENT_END_DATE'))]
