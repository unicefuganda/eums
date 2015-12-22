from eums.models import ReleaseOrder, Consignee, PurchaseOrderItem, ReleaseOrderItem, Item, SalesOrder, PurchaseOrder
from eums.settings import VISION_URL
from eums.vision.order_synchronizer import OrderSynchronizer


class ReleaseOrderSynchronizer(OrderSynchronizer):
    RELEASE_ORDER_URL = VISION_URL + 'GetReleaseOrderInfo_JSON/'
    MAPPING_TEMPLATE = {'RELEASE_ORDER_NUMBER': 'order_number',
                        'RELEASE_ORDER_ITEM': 'ro_item_number',
                        'SHIPMENT_END_DATE': 'shipment_end_date',
                        'MATERIAL_NUMBER': 'material_code',
                        'DELIVERY_QUANTITY': 'quantity',
                        'VALUE': 'value',
                        'CONSIGNEE': 'consignee',
                        'SO_NUMBER': 'so_number',
                        'PO_NUMBER': 'purchase_order',
                        'WAYBILL_NUMBER': 'waybill',
                        'PO_ITEM': 'po_item_number'}

    def __init__(self, start_date, end_date=''):
        kwargs = {'mapping_template': ReleaseOrderSynchronizer.MAPPING_TEMPLATE,
                  'base_url': ReleaseOrderSynchronizer.RELEASE_ORDER_URL,
                  'start_date': start_date,
                  'end_date': end_date}
        super(ReleaseOrderSynchronizer, self).__init__(**kwargs)

    def _get_or_create_new_order(self, order):
        matching_release_orders = ReleaseOrder.objects.filter(order_number=order['order_number'])
        if len(matching_release_orders):
            return matching_release_orders[0]

        if not (order['waybill'] and order['shipment_end_date']):
            return None

        consignee = self._update_or_create_new_consignee(order)
        matching_sales_orders = self._get_matching_sales_order(order)
        matching_purchase_orders = self._get_matching_purchase_order(order)

        if len(matching_sales_orders) and len(matching_purchase_orders):
            return ReleaseOrder.objects.create(order_number=order['order_number'],
                                               waybill=order['waybill'],
                                               delivery_date=self._convert_date_format(order['shipment_end_date']),
                                               consignee=consignee,
                                               sales_order=matching_sales_orders[0],
                                               purchase_order=matching_purchase_orders[0])

    def _update_or_create_new_item(self, release_order_item, order):
        if float(release_order_item['value']) == 0 or float(release_order_item['quantity']) == 0:
            return None

        matching_purchase_orders = self._get_matching_purchase_order(release_order_item)
        if len(matching_purchase_orders):
            matching_purchase_order_items = PurchaseOrderItem.objects.filter(purchase_order=matching_purchase_orders[0],
                                                                             item_number=release_order_item[
                                                                                 'po_item_number'])

            if len(matching_purchase_order_items):
                matching_ro_items = ReleaseOrderItem.objects.filter(release_order__order_number=order.order_number,
                                                                    purchase_order_item=matching_purchase_order_items[0])
                if not len(matching_ro_items):
                    item, _ = Item.objects.get_or_create(material_code=release_order_item['material_code'])

                    ReleaseOrderItem.objects.create(release_order=order,
                                                    purchase_order_item=matching_purchase_order_items[0],
                                                    item=item,
                                                    item_number=release_order_item['ro_item_number'],
                                                    quantity=float(release_order_item['quantity']),
                                                    value=float(release_order_item['value']))
                else:
                    return self._update_order_item(matching_ro_items[0],
                                                   float(release_order_item['quantity']),
                                                   float(release_order_item['value']))

    def _append_new_order(self, record, order_number, orders):
        sales_order = record['so_number']
        purchase_order = record['purchase_order']
        consignee = record['consignee']
        consignee_name = ''
        waybill = record['waybill']
        shipment_end_date = record['shipment_end_date']
        self._remove_order_level_data_from(record)
        orders.append({'so_number': sales_order, 'purchase_order': purchase_order, 'order_number': order_number,
                       'consignee': consignee, 'consignee_name': consignee_name,
                       'shipment_end_date': shipment_end_date, 'waybill': waybill,
                       'items': [record]})

    def _append_new_item(self, record, order_index, orders):
        self._remove_order_level_data_from(record)
        orders[order_index].get('items').append(record)

    @staticmethod
    def _update_or_create_new_consignee(order):
        consignee, _ = Consignee.objects.get_or_create(customer_id=order['consignee'])
        consignee.imported_from_vision = True
        consignee.save()
        return consignee

    @staticmethod
    def _update_order_item(matching_item, quantity, value):
        matching_item.quantity = quantity
        matching_item.value = value
        matching_item.save()
        return matching_item

    @staticmethod
    def _remove_order_level_data_from(item_dict):
        del item_dict['order_number']
        del item_dict['so_number']
        del item_dict['consignee']
        del item_dict['waybill']
        del item_dict['shipment_end_date']

    @staticmethod
    def _get_matching_sales_order(order_dict):
        if not isinstance(order_dict['so_number'], basestring):
            return SalesOrder.objects.filter(order_number=order_dict['so_number'])
        return []

    @staticmethod
    def _get_matching_purchase_order(order_dict):
        if not isinstance(order_dict['purchase_order'], basestring):
            return PurchaseOrder.objects.filter(order_number=order_dict['purchase_order'])
        return []
