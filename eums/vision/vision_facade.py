from xlutils.view import View
from eums.models import SalesOrder, Item, SalesOrderItem, Programme, ReleaseOrder, Consignee, ReleaseOrderItem
from datetime import datetime


class Facade():
    RELEVANT_DATA = {}

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
                item_dict[relevant_data.get(col_index)] = str(value)

        return item_dict

    @classmethod
    def _index_in_list(cls, number, order_list, label):
        for index, order in enumerate(order_list):
            if order.get(label) == number:
                return index
        return -1

    def _convert_view_to_list_of_dicts(self, sheet, relevant_data):
        order_list = []
        for row in sheet:
            item_dict = self._filter_relevant_data(relevant_data, row)

            order_number = item_dict['order_number']
            order_index = self._index_in_list(order_number, order_list, 'order_number')
            if order_index > -1:
                order_list[order_index].get('items').append(item_dict)
            else:
                self._append_new_order(item_dict, order_list, order_number)

        return order_list

    def _create_order_from_dict(self, order):
        new_order = self._create_new_order(order)

        for item in order['items']:
            self._create_new_item(item, new_order)

    def _append_new_order(self, item_dict, order_list, order_number):
        pass

    def _create_new_order(self, order):
        pass

    def _create_new_item(self, item, order):
        pass


class SalesOrderFacade(Facade):
    RELEVANT_DATA = {
        1: 'order_number', 7: 'material_code', 8: 'quantity', 10: 'date', 11: 'issue_date', 12: 'delivery_date',
        15: 'net_price', 16: 'net_value', 19: 'programme_name'
    }

    def _create_new_item(self, item, order):
        order_item = SalesOrderItem()
        order_item.sales_order = order
        order_item.item = Item.objects.get(material_code=item['material_code'])
        order_item.quantity = float(item['quantity'].replace(',', ''))
        order_item.issue_date = datetime.strptime(item['issue_date'], "%m/%d/%Y")
        order_item.delivery_date = datetime.strptime(item['delivery_date'], "%m/%d/%Y")
        order_item.net_price = float(item['net_price'].replace(',', ''))
        order_item.net_value = float(item['net_value'].replace(',', ''))
        order_item.save()

    def _create_new_order(self, order):
        new_order = SalesOrder()
        new_order.order_number = order['order_number']
        new_order.date = datetime.strptime(order['items'][0]['issue_date'], "%m/%d/%Y")
        new_order.programme = Programme.objects.get(name=order['programme_name'])
        new_order.save()
        return new_order

    def _append_new_order(self, item_dict, order_list, order_number):
        sales_order_program = item_dict['programme_name']
        order_list.append({'order_number': order_number, 'programme_name': sales_order_program,
                           'items': [item_dict]})


class ReleaseOrderFacade(Facade):
    RELEVANT_DATA = {0: 'order_number', 3: 'recommended_delivery_date', 4: 'material_code', 5: 'description',
                     6: 'quantity', 7: 'value', 11: 'consignee', 14: 'sales_order', 15: 'purchase_order'}

    def _create_new_item(self, item, order):
        order_item = ReleaseOrderItem()
        order_item.release_order = order
        order_item.purchase_order = item['purchase_order']
        order_item.item = Item.objects.get(material_code=item['material_code'])
        order_item.quantity = float(item['quantity'])
        order_item.value = float(item['value'])
        order_item.save()

    def _create_new_order(self, order):
        new_order = ReleaseOrder()
        new_order.order_number = order['order_number']
        new_order.sales_order = SalesOrder.objects.get(order_number=order['sales_order'])
        new_order.delivery_date = datetime.strptime(order['recommended_delivery_date'], "%m/%d/%Y")
        new_order.consignee = Consignee.objects.get(customer_id=order['consignee'])
        new_order.save()
        return new_order

    def _append_new_order(self, item_dict, order_list, order_number):
        sales_order = item_dict['sales_order']
        consignee = item_dict['consignee']
        recommended_delivery_date = item_dict['recommended_delivery_date']
        order_list.append({'sales_order': sales_order, 'order_number': order_number, 'consignee': consignee,
                           'recommended_delivery_date': recommended_delivery_date, 'items': [item_dict]})
