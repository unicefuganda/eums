from xlutils.view import View
from eums.models import SalesOrder, Item
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
        sales_order = _create_sales_order_from_dict(sales_order_data)
        sales_order.save()


def _create_sales_order_from_dict(sales_order_data):
    sales_order = SalesOrder()
    sales_order.order_number = sales_order_data['order_number']
    sales_order.item = Item.objects.get(material_code=sales_order_data['material_code'])
    sales_order.quantity = float(sales_order_data['quantity'].replace(',', ''))
    sales_order.issue_date = datetime.strptime(sales_order_data['issue_date'], "%m/%d/%Y")
    sales_order.delivery_date = datetime.strptime(sales_order_data['delivery_date'], "%m/%d/%Y")
    sales_order.net_price = float(sales_order_data['net_price'].replace(',', ''))
    sales_order.net_value = float(sales_order_data['net_value'].replace(',', ''))
    return sales_order


def _convert_view_to_list_of_dicts(sheet, relevant_data):
    sales_orders_lists = []
    for row in sheet:
        sales_order_dict = {}
        for col_index, value in enumerate(row):
            if relevant_data.get(col_index):
                sales_order_dict[relevant_data.get(col_index)] = str(value)
        sales_orders_lists.append(sales_order_dict)

    return sales_orders_lists