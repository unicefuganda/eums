from xlutils.view import View
from eums.models import SalesOrder, Item, SalesOrderItem
from datetime import datetime


def import_sales_orders(location):
    sales_order_data = load_sales_order_data(location)
    save_sales_order_data(sales_order_data)


def load_sales_order_data(location):
    view = View(location)
    relevant_data = {1: 'order_number', 7: 'material_code', 8: 'quantity', 11: 'issue_date', 12: 'delivery_date',
                     15: 'net_price', 16: 'net_value'}

    return _convert_view_to_list_of_dicts(view[0][1:, :], relevant_data)


def save_sales_order_data(sales_orders_data):
    for sales_order_data in sales_orders_data:
        _create_sales_order_from_dict(sales_order_data)


def _create_sales_order_from_dict(sales_order_data):
    sales_order = SalesOrder()
    sales_order.order_number = sales_order_data['order_number']
    sales_order.save()

    for sales_order_item_data in sales_order_data['items']:
        sales_order_item = SalesOrderItem()
        sales_order_item.sales_order = sales_order
        sales_order_item.item = Item.objects.get(material_code=sales_order_item_data['material_code'])
        sales_order_item.quantity = float(sales_order_item_data['quantity'].replace(',', ''))
        sales_order_item.issue_date = datetime.strptime(sales_order_item_data['issue_date'], "%m/%d/%Y")
        sales_order_item.delivery_date = datetime.strptime(sales_order_item_data['delivery_date'], "%m/%d/%Y")
        sales_order_item.net_price = float(sales_order_item_data['net_price'].replace(',', ''))
        sales_order_item.net_value = float(sales_order_item_data['net_value'].replace(',', ''))
        sales_order_item.save()


def _convert_view_to_list_of_dicts(sheet, relevant_data):
    sales_orders_list = []
    for row in sheet:
        sales_order_item_dict = {}

        for col_index, value in enumerate(row):
            if relevant_data.get(col_index):
                sales_order_item_dict[relevant_data.get(col_index)] = str(value)

        sales_order_number = sales_order_item_dict['order_number']
        sales_order_index = _sales_order_index_in_list(sales_order_number, sales_orders_list)

        if sales_order_index > -1:
            sales_orders_list[sales_order_index].get('items').append(sales_order_item_dict)
        else:
            sales_orders_list.append({'order_number': sales_order_number, 'items': [sales_order_item_dict]})

    return sales_orders_list


def _sales_order_index_in_list(sales_order_number, sales_order_list):
    for index, sales_order in enumerate(sales_order_list):
        if sales_order.get('order_number') == sales_order_number:
            return index
    return -1