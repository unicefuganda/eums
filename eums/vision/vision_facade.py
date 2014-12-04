from abc import ABCMeta, abstractmethod
from xlutils.view import View
from eums.models import SalesOrder, Item, SalesOrderItem, Programme, ReleaseOrder, Consignee, ReleaseOrderItem
from datetime import datetime


def _clean_input(value):
    if type(value) == int:
        return value
    elif type(value) == str:
        return value.encode("'utf8'")
    else:
        return value


class Facade():
    RELEVANT_DATA = {}

    __metaclass__ = ABCMeta

    def __init__(self, location):
        self.location = location

    def import_orders(self):
        order_data = self.load_order_data()
        self.save_order_data(order_data)

    def load_order_data(self):
        view = View(self.location)
        return self._convert_view_to_list_of_dicts(view[0][1:, :], self.RELEVANT_DATA)

    def save_order_data(self, orders):
        for order in orders:
            self._create_order_from_dict(order)

    @classmethod
    def _filter_relevant_data(cls, relevant_data, row):
        item_dict = {}
        for col_index, value in enumerate(row):
            if relevant_data.get(col_index):
                item_dict[relevant_data.get(col_index)] = _clean_input(value)

        return item_dict

    @classmethod
    def _index_in_list(cls, number, order_list, label):
        for index, order in enumerate(order_list):
            if order.get(label) == number:
                return index
        return -1

    @staticmethod
    def _remove_order_level_data_from(item_dict):
        del item_dict['order_number']
        del item_dict['programme_wbs_element']

    def _convert_view_to_list_of_dicts(self, sheet, relevant_data):
        order_list = []
        for row in sheet:
            item_dict = self._filter_relevant_data(relevant_data, row)

            order_number = item_dict['order_number']
            order_index = self._index_in_list(order_number, order_list, 'order_number')
            if order_index > -1:
                self._remove_order_level_data_from(item_dict)
                order_list[order_index].get('items').append(item_dict)
            else:
                self._append_new_order(item_dict, order_list, order_number)

        return order_list

    def _create_order_from_dict(self, order):
        new_order = self._create_new_order(order)

        for item in order['items']:
            self._create_new_item(item, new_order)

    @abstractmethod
    def _append_new_order(self, item_dict, order_list, order_number):
        pass

    @abstractmethod
    def _create_new_order(self, order):
        pass

    @abstractmethod
    def _create_new_item(self, item, order):
        pass


class SalesOrderFacade(Facade):
    RELEVANT_DATA = {
        0: 'order_number', 2: 'material_code', 10: 'item_description', 3: 'quantity', 9: 'date', 5: 'net_value',
        13: 'programme_wbs_element', 1: 'item_number'
    }

    def _create_new_item(self, item, order):
        order_item = SalesOrderItem()
        order_item.sales_order = order
        sales_order_item, created = Item.objects.get_or_create(material_code=item['material_code'],
                                                               description=item['item_description'])
        order_item.item = sales_order_item
        order_item.description = item['item_description']
        order_item.quantity = item['quantity']
        order_item.issue_date = item['issue_date'].date()
        order_item.delivery_date = item['delivery_date'].date()
        order_item.net_price = item['net_price']
        order_item.net_value = item['net_value']
        order_item.save()

    def _append_new_order(self, item_dict, order_list, order_number):
        sales_order_program_wbs = self._trim_programme_wbs(item_dict['programme_wbs_element'])
        self._remove_order_level_data_from(item_dict)
        order_list.append({'order_number': order_number, 'programme_wbs_element': sales_order_program_wbs,
                           'items': [item_dict]})

    def _create_new_order(self, order):
        new_order = SalesOrder()
        new_order.order_number = order['order_number']
        new_order.date = order['items'][0]['issue_date'].date()
        programme, created = Programme.objects.get_or_create(name=order['programme_name'])
        new_order.programme = programme
        new_order.save()
        return new_order

    @staticmethod
    def _trim_programme_wbs(extended_programme_wbs):
        wbs_element_list = extended_programme_wbs.split('/')[:4]
        return '/'.join(wbs_element_list)


class ReleaseOrderFacade(Facade):
    RELEVANT_DATA = {0: 'order_number', 3: 'recommended_delivery_date', 4: 'material_code', 5: 'description',
                     6: 'quantity', 7: 'value', 11: 'consignee', 14: 'sales_order', 15: 'purchase_order', 22: 'waybill'}

    def _create_new_order(self, order):
        new_order = ReleaseOrder()
        new_order.order_number = order['order_number']
        new_order.sales_order = SalesOrder.objects.get(order_number=order['sales_order'])
        new_order.waybill = order['waybill']
        new_order.delivery_date = datetime.strptime(order['recommended_delivery_date'], "%d/%m/%Y")
        new_order.consignee = Consignee.objects.get(customer_id=order['consignee'])
        new_order.save()
        return new_order

    def _create_new_item(self, item, order):
        order_item = ReleaseOrderItem()
        order_item.release_order = order
        order_item.purchase_order = item['purchase_order']
        order_item.item = Item.objects.get(material_code=item['material_code'])
        order_item.quantity = float(item['quantity'])
        order_item.value = float(item['value'])
        order_item.save()

    def _append_new_order(self, item_dict, order_list, order_number):
        sales_order = item_dict['sales_order']
        consignee = item_dict['consignee']
        waybill = item_dict['waybill']
        recommended_delivery_date = item_dict['recommended_delivery_date']
        order_list.append({'sales_order': sales_order, 'order_number': order_number, 'consignee': consignee,
                           'recommended_delivery_date': recommended_delivery_date, 'waybill': waybill,
                           'items': [item_dict]})


