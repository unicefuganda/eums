from xlutils.view import View
from eums.models import SalesOrder, Item, SalesOrderItem, Programme, ReleaseOrder, Consignee, ReleaseOrderItem
from datetime import datetime


def import_sales_orders(location):
    order_data = load_sales_order_data(location)
    save_sales_order_data(order_data)


def import_release_orders(location):
    order_data = load_release_order_data(location)
    save_release_order_data(order_data)


def load_sales_order_data(location):
    view = View(location)

    relevant_data = {1: 'order_number', 7: 'material_code', 8: 'quantity', 10: 'date', 11: 'issue_date',
                     12: 'delivery_date',
                     15: 'net_price', 16: 'net_value', 19: 'programme_name'}

    return _convert_sales_order_view_to_list_of_dicts(view[0][1:, :], relevant_data)


def load_release_order_data(location):
    view = View(location)

    relevant_data = {0: 'order_number', 3: 'recommended_delivery_date', 4: 'material_code', 5: 'description',
                     6: 'quantity', 7: 'value', 11: 'consignee', 14: 'sales_order', 15: 'purchase_order'}

    return _convert_release_order_view_to_list_of_dicts(view[0][1:, :], relevant_data)


def save_sales_order_data(sales_orders_data):
    for sales_order_data in sales_orders_data:
        _create_sales_order_from_dict(sales_order_data)


def _create_sales_order_from_dict(order):
    sales_order = SalesOrder()
    sales_order.order_number = order['order_number']
    sales_order.date = datetime.strptime(order['items'][0]['issue_date'], "%m/%d/%Y")
    sales_order.programme = Programme.objects.get(name=order['programme_name'])
    sales_order.save()

    for item in order['items']:
        order_item = SalesOrderItem()
        order_item.sales_order = sales_order
        order_item.item = Item.objects.get(material_code=item['material_code'])
        order_item.quantity = float(item['quantity'].replace(',', ''))
        order_item.issue_date = datetime.strptime(item['issue_date'], "%m/%d/%Y")
        order_item.delivery_date = datetime.strptime(item['delivery_date'], "%m/%d/%Y")
        order_item.net_price = float(item['net_price'].replace(',', ''))
        order_item.net_value = float(item['net_value'].replace(',', ''))
        order_item.save()


def _create_release_order_from_dict(order):
    release_order = ReleaseOrder()
    release_order.order_number = order['order_number']
    release_order.sales_order = SalesOrder.objects.get(order_number=order['sales_order'])
    release_order.delivery_date = datetime.strptime(order['recommended_delivery_date'], "%m/%d/%Y")
    release_order.consignee = Consignee.objects.get(customer_id=order['consignee'])
    release_order.save()

    for item in order['items']:
        order_item = ReleaseOrderItem()
        order_item.release_order = release_order
        order_item.purchase_order = item['purchase_order']
        order_item.item = Item.objects.get(material_code=item['material_code'])
        order_item.quantity = float(item['quantity'])
        order_item.value = float(item['value'])
        order_item.save()


def save_release_order_data(orders):
    for order in orders:
            _create_release_order_from_dict(order)


def _filter_relevant_data(relevant_data, row):
    item_dict = {}
    for col_index, value in enumerate(row):
        if relevant_data.get(col_index):
            item_dict[relevant_data.get(col_index)] = str(value)

    return item_dict


def _convert_sales_order_view_to_list_of_dicts(sheet, relevant_data):
    order_list = []
    for row in sheet:
        item_dict = _filter_relevant_data(relevant_data, row)

        sales_order_number = item_dict['order_number']
        sales_order_program = item_dict['programme_name']
        order_index = _index_in_list(sales_order_number, order_list, 'order_number')

        if order_index > -1:
            order_list[order_index].get('items').append(item_dict)
        else:
            order_list.append({'order_number': sales_order_number, 'programme_name': sales_order_program,
                               'items': [item_dict]})

    return order_list


def _convert_release_order_view_to_list_of_dicts(sheet, relevant_data):
    order_list = []
    for row in sheet:
        item_dict = _filter_relevant_data(relevant_data, row)

        sales_order = item_dict['sales_order']
        order_number = item_dict['order_number']
        consignee = item_dict['consignee']
        recommended_delivery_date = item_dict['recommended_delivery_date']

        order_index = _index_in_list(order_number, order_list, 'order_number')

        if order_index > -1:
            order_list[order_index].get('items').append(item_dict)
        else:
            order_list.append({'sales_order': sales_order, 'order_number': order_number, 'consignee': consignee,
                               'recommended_delivery_date': recommended_delivery_date, 'items': [item_dict]})

    return order_list


def _index_in_list(number, order_list, label):
    for index, order in enumerate(order_list):
        if order.get(label) == number:
            return index
    return -1
