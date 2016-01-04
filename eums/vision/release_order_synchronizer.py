from django.core.exceptions import ObjectDoesNotExist

from eums.models import ReleaseOrder, Consignee, PurchaseOrderItem, ReleaseOrderItem, Item, SalesOrder, PurchaseOrder
from eums.settings import VISION_URL
from eums.vision.order_synchronizer import OrderSynchronizer
from eums.vision.vision_data_synchronizer import VisionException


class ReleaseOrderSynchronizer(OrderSynchronizer):
    RELEASE_ORDER_URL = VISION_URL + 'GetReleaseOrderInfo_JSON/'
    REQUIRED_KEYS = ('RELEASE_ORDER_NUMBER', 'RELEASE_ORDER_ITEM', 'SHIPMENT_END_DATE', 'MATERIAL_NUMBER',
                     'DELIVERY_QUANTITY', 'VALUE', 'CONSIGNEE', 'SO_NUMBER', 'PO_NUMBER', 'WAYBILL_NUMBER', 'PO_ITEM')
    ORDER_INFO = ('RELEASE_ORDER_NUMBER', 'WAYBILL_NUMBER', 'SO_NUMBER', 'PO_NUMBER', 'CONSIGNEE', 'SHIPMENT_END_DATE')

    def __init__(self, start_date, end_date=''):
        super(ReleaseOrderSynchronizer, self).__init__(ReleaseOrderSynchronizer.RELEASE_ORDER_URL, start_date, end_date,
                                                       ReleaseOrderSynchronizer.ORDER_INFO)

    def _filter_records(self, records):
        def is_valid_record(record):
            digit_fields = ('RELEASE_ORDER_NUMBER', 'SO_NUMBER', 'PO_NUMBER')
            for key in ReleaseOrderSynchronizer.REQUIRED_KEYS:
                if not (record[key] and OrderSynchronizer._is_all_digit(digit_fields, key, record)):
                    return False
            return True

        return filter(is_valid_record, records)

    def _get_or_create_order(self, record):
        try:
            return ReleaseOrder.objects.get(order_number=record['RELEASE_ORDER_NUMBER'])
        except ObjectDoesNotExist:
            try:
                consignee = self._update_or_create_consignee(record)
                sales_order = SalesOrder.objects.get(order_number=record['SO_NUMBER'])
                purchase_order = PurchaseOrder.objects.get(order_number=record['PO_NUMBER'])
                return ReleaseOrder.objects.create(order_number=record['RELEASE_ORDER_NUMBER'],
                                                   waybill=record['WAYBILL_NUMBER'],
                                                   delivery_date=record['SHIPMENT_END_DATE'],
                                                   consignee=consignee,
                                                   sales_order=sales_order,
                                                   purchase_order=purchase_order)
            except ObjectDoesNotExist:
                pass
        except Exception, e:
            raise VisionException(message='Get or create release order error: ' + e.message)

    def _update_or_create_item(self, record, order):
        try:
            purchase_order = PurchaseOrder.objects.get(order_number=record['PO_NUMBER'])
            purchase_order_item = PurchaseOrderItem.objects.get(purchase_order=purchase_order,
                                                                item_number=record['PO_ITEM'])
            try:
                release_order_item = ReleaseOrderItem.objects.get(release_order__order_number=order.order_number,
                                                                  purchase_order_item=purchase_order_item)
                return self._update_item(release_order_item, record['DELIVERY_QUANTITY'], record['VALUE'])
            except ObjectDoesNotExist:
                item, _ = Item.objects.get_or_create(id=purchase_order_item.item_id)
                return ReleaseOrderItem.objects.create(release_order=order,
                                                       purchase_order_item=purchase_order_item,
                                                       item=item,
                                                       item_number=record['RELEASE_ORDER_ITEM'],
                                                       quantity=record['DELIVERY_QUANTITY'],
                                                       value=record['VALUE'])
        except ObjectDoesNotExist:
            pass
        except Exception, e:
            raise VisionException(message='Update or create release order item error: ' + e.message)

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
