from abc import ABCMeta, abstractmethod
from decimal import Decimal
from datetime import date, datetime
import re
from xlrd.xldate import XLDateAmbiguous

from xlutils.view import View

from eums.models import SalesOrder, Item, SalesOrderItem, Programme, ReleaseOrder, Consignee, ReleaseOrderItem, \
    PurchaseOrder, PurchaseOrderItem


class ImportException(Exception):
    pass


def _clean_input(value):
    parse_string = lambda x: x.isalpha() and x or x.isdigit() and int(x) or \
                             re.match('(?i)^-?(\d+\.?e\d+|\d+\.\d*|\.\d+)$', x) and float(x) or x

    if type(value) == unicode:
        encoded_value = value.encode('ascii', 'ignore')
        value = parse_string(encoded_value)
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

    @classmethod
    def _filter_relevant_data(cls, relevant_data, row):
        item_dict = {}
        coll_being_enumerated = 0
        try:
            for col_index, value in enumerate(row):
                if relevant_data.get(col_index):
                    item_dict[relevant_data.get(col_index)] = _clean_input(value)
                coll_being_enumerated = col_index + 1
        except Exception, e:
            raise ImportException(str(coll_being_enumerated))

        return item_dict

    def _has_all_relevant_data(self, row):
        for column in self.RELEVANT_DATA.values():
            if not str(row[column]).strip():
                raise ImportException(str(column))
        return True

    def import_records(self):
        records = self.load_records()
        self.save_records(records)

    def load_records(self):
        view = View(self.location)
        return self._convert_view_to_list_of_dicts(view[0][1:, :], self.RELEVANT_DATA)

    def save_records(self, records):
        for record in records:
            self._create_record_from_dict(record)

    def _convert_view_to_list_of_dicts(self, sheet, relevant_data):
        records_list = []
        row_number = 1
        for row in sheet:
            row_number += 1
            try:
                item_dict = self._filter_relevant_data(relevant_data, row)
                if self._has_all_relevant_data(item_dict):
                    records_list.append(item_dict)
            except ImportException as e:
                raise ImportException(
                    "Import has failed due to missing [{0}] in row [{1}]. "
                    "Please correct the error then try the upload again"
                    .format(e.message, str(row_number)))
            except XLDateAmbiguous:
                pass

        return records_list

    @abstractmethod
    def _create_record_from_dict(self, record_dict):
        pass


class OrderFacade(Facade):
    __metaclass__ = ABCMeta

    @classmethod
    def _index_in_list(cls, number, order_list, label):
        for index, order in enumerate(order_list):
            if order.get(label) == number:
                return index
        return -1

    def _convert_view_to_list_of_dicts(self, sheet, relevant_data):
        print '*' * 50, 'convert view to list of dicts called with sheet', len([row for row in sheet]), '*' * 50
        order_list = []
        row_num = 1
        for row in sheet:
            try:
                item_dict = self._filter_relevant_data(relevant_data, row)
                if not self._is_summary_row(item_dict):
                    print '*' * 50, 'not summary row', item_dict, '*' * 50
                    order_number = item_dict['order_number']
                    order_index = self._index_in_list(order_number, order_list, 'order_number')
                    if order_index > -1:
                        self._remove_order_level_data_from(item_dict)
                        order_list[order_index].get('items').append(item_dict)
                    else:
                        self._append_new_order(item_dict, order_list, order_number)
            except XLDateAmbiguous:
                raise Exception("Ambiguous excel date")
                pass
            except ImportException, e:
                raise Exception(
                    "Import has failed due to an error in row [{0}] column [{1}]. "
                    "Please correct the error then try the upload again"
                    .format(str(row_num), e.message))
                pass
            row_num += 1
        return order_list

    def _is_summary_row(self, row):
        for column in self.RELEVANT_DATA.values():
            if row[column] is '':
                return True
        return False

    def _create_record_from_dict(self, record_dict):
        new_order = self._create_new_order(record_dict)
        if new_order:
            for item in record_dict['items']:
                self._create_new_item(item, new_order)

    @staticmethod
    def _get_as_date(raw_value):
        if type(raw_value) is date:
            return raw_value.date()
        elif type(raw_value) is datetime:
            return raw_value.date()
        date_args = raw_value.split('-')
        return date(int(date_args[0]), int(date_args[1]), int(date_args[2]))

    @abstractmethod
    def _append_new_order(self, item_dict, order_list, order_number):
        pass

    @abstractmethod
    def _create_new_order(self, order):
        pass

    @abstractmethod
    def _create_new_item(self, item, order):
        pass

    @abstractmethod
    def _remove_order_level_data_from(self, item_dict):
        pass


class SalesOrderFacade(OrderFacade):
    RELEVANT_DATA = {
        0: 'order_number', 2: 'material_code', 10: 'item_description', 3: 'quantity', 9: 'date', 5: 'net_value',
        13: 'programme_wbs_element', 1: 'item_number'
    }

    def _update_order_item(self, order_item, order_date, quantity, net_value, net_price):
        order_item.issue_date = order_date
        order_item.delivery_date = order_date
        order_item.quantity = quantity
        order_item.net_value = net_value
        order_item.net_price = net_price
        order_item.save()
        return order_item

    def _create_new_item(self, sales_order_item_dict, order):
        item, created = Item.objects.get_or_create(material_code=sales_order_item_dict['material_code'],
                                                   description=sales_order_item_dict['item_description'])

        order_date = self._get_as_date(sales_order_item_dict['date'])
        quantity = int(sales_order_item_dict['quantity'])
        net_value = Decimal(sales_order_item_dict['net_value'])
        net_price = net_value / quantity if quantity else 0

        matching_items = SalesOrderItem.objects.filter(sales_order=order, item=item,
                                                       item_number=sales_order_item_dict['item_number'])

        if len(matching_items):
            return self._update_order_item(matching_items[0], order_date, quantity, net_value, net_price)

        return SalesOrderItem.objects.get_or_create(sales_order=order, item=item,
                                                    item_number=sales_order_item_dict['item_number'],
                                                    description=sales_order_item_dict['item_description'],
                                                    quantity=quantity,
                                                    issue_date=order_date, delivery_date=order_date,
                                                    net_value=net_value, net_price=net_price)

    def _append_new_order(self, item_dict, order_list, order_number):
        sales_order_program_wbs = self._trim_programme_wbs(item_dict['programme_wbs_element'])
        self._remove_order_level_data_from(item_dict)
        order_list.append({'order_number': order_number, 'programme_wbs_element': sales_order_program_wbs,
                           'items': [item_dict]})

    def _create_new_order(self, order):
        order_number = order['order_number']
        matching_sales_orders = SalesOrder.objects.filter(order_number=order_number)

        if len(matching_sales_orders):
            return matching_sales_orders[0]

        programme, created = Programme.objects.get_or_create(wbs_element_ex=order['programme_wbs_element'])
        return SalesOrder.objects.create(order_number=order_number, programme=programme,
                                         date=self._get_as_date(order['items'][0]['date']))

    def _remove_order_level_data_from(self, item_dict):
        del item_dict['order_number']
        del item_dict['programme_wbs_element']

    @staticmethod
    def _trim_programme_wbs(extended_programme_wbs):
        wbs_element_list = extended_programme_wbs.split('/')[:5]
        return '/'.join(wbs_element_list)


class ReleaseOrderFacade(OrderFacade):
    RELEVANT_DATA = {0: 'order_number', 1: 'ro_item_number', 3: 'recommended_delivery_date', 4: 'material_code',
                     5: 'description',
                     6: 'quantity', 7: 'value', 11: 'consignee', 14: 'so_number', 15: 'purchase_order', 22: 'waybill',
                     40: 'so_item_number', 41: 'po_item_number', 12: 'consignee_name'}

    def _create_new_order(self, order_dict):
        matching_release_orders = ReleaseOrder.objects.filter(order_number=order_dict['order_number'])
        if len(matching_release_orders):
            return matching_release_orders[0]

        consignee, _ = Consignee.objects.get_or_create(customer_id=order_dict['consignee'],
                                                       name=order_dict['consignee_name'])

        matching_sales_orders = self._get_matching_sales_order(order_dict)
        matching_purchase_orders = self._get_matching_purchase_order(order_dict)
        if len(matching_sales_orders) and len(matching_purchase_orders):
            return ReleaseOrder.objects.create(order_number=order_dict['order_number'], waybill=order_dict['waybill'],
                                               delivery_date=self._get_as_date(order_dict['recommended_delivery_date']),
                                               consignee=consignee,
                                               sales_order=matching_sales_orders[0],
                                               purchase_order=matching_purchase_orders[0])

    def _update_item(self, ro_item, quantity, value):
        ro_item.quantity = quantity
        ro_item.value = value
        ro_item.save()

    def _create_new_item(self, item_dict, order):
        matching_purchase_orders = self._get_matching_purchase_order(item_dict)

        if len(matching_purchase_orders):
            matching_purchase_order_items = PurchaseOrderItem.objects.filter(purchase_order=matching_purchase_orders[0],
                                                                             item_number=item_dict['po_item_number'])

            if len(matching_purchase_order_items):
                matching_ro_items = ReleaseOrderItem.objects.filter(release_order__order_number=order.order_number,
                                                                    purchase_order_item=matching_purchase_order_items[
                                                                        0])
                if not len(matching_ro_items):
                    item, _ = Item.objects.get_or_create(material_code=item_dict['material_code'],
                                                         description=item_dict['description'])
                    ReleaseOrderItem.objects.create(release_order=order,
                                                    purchase_order_item=matching_purchase_order_items[0],
                                                    item=item,
                                                    item_number=item_dict['ro_item_number'],
                                                    quantity=float(item_dict['quantity']),
                                                    value=float(item_dict['value']))
                else:
                    ro_item = matching_ro_items[0]
                    self._update_item(ro_item, float(item_dict['quantity']), float(item_dict['value']))

    def _append_new_order(self, item_dict, order_list, order_number):
        sales_order = item_dict['so_number']
        purchase_order = item_dict['purchase_order']
        consignee = item_dict['consignee']
        consignee_name = item_dict['consignee_name']
        waybill = item_dict['waybill']
        recommended_delivery_date = item_dict['recommended_delivery_date']
        self._remove_order_level_data_from(item_dict)
        order_list.append({'so_number': sales_order, 'purchase_order': purchase_order, 'order_number': order_number,
                           'consignee': consignee, 'consignee_name': consignee_name,
                           'recommended_delivery_date': recommended_delivery_date, 'waybill': waybill,
                           'items': [item_dict]})

    def _remove_order_level_data_from(self, item_dict):
        del item_dict['order_number']
        del item_dict['so_number']
        del item_dict['consignee']
        del item_dict['consignee_name']
        del item_dict['waybill']
        del item_dict['recommended_delivery_date']

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


class PurchaseOrderFacade(OrderFacade):
    RELEVANT_DATA = {6: 'order_number', 7: 'po_item_number', 9: 'material_code', 10: 'material_description',
                     16: 'value', 18: 'quantity', 20: 'so_number', 21: 'so_item_number', 42: 'po_date'}

    def _create_new_order(self, order_dict):
        print '*' * 50, 'create new order in po facade with dict', order_dict, '*' * 50
        matching_purchase_orders = PurchaseOrder.objects.filter(order_number=order_dict['order_number'])
        if len(matching_purchase_orders):
            return matching_purchase_orders[0]

        matching_sales_orders = self._get_matching_sales_order(order_dict)
        po_date = None if order_dict['po_date'] == '' else self._get_as_date(order_dict['po_date'])
        if len(matching_sales_orders):
            print '*' * 50, 'sales order matching purchase order exists', '*' * 50
            return PurchaseOrder.objects.create(order_number=order_dict['order_number'],
                                                sales_order=matching_sales_orders[0],
                                                date=po_date)

    def _save_item(self, po_item, quantity, value):
        po_item.quantity = quantity
        po_item.value = value
        po_item.save()

    def _create_new_item(self, item_dict, order):
        matching_sales_order_items = order.sales_order.salesorderitem_set.filter(
            item_number=item_dict['so_item_number'])

        if len(matching_sales_order_items):
            matching_po_items = PurchaseOrderItem.objects.filter(purchase_order__order_number=order.order_number,
                                                                 item_number=item_dict['po_item_number'],
                                                                 sales_order_item=matching_sales_order_items[0])

            if not len(matching_po_items):
                item, _ = Item.objects.get_or_create(material_code=item_dict['material_code'],
                                                     description=item_dict['material_description'])
                PurchaseOrderItem.objects.get_or_create(purchase_order=order,
                                                        item=item,
                                                        item_number=item_dict['po_item_number'],
                                                        sales_order_item=matching_sales_order_items[0],
                                                        quantity=float(item_dict['quantity']),
                                                        value=float(item_dict['value']))
            else:
                po_item = matching_po_items[0]
                self._save_item(po_item, float(item_dict['quantity']), float(item_dict['value']))

    def _append_new_order(self, item_dict, order_list, order_number):
        sales_order = item_dict['so_number']
        po_date = item_dict['po_date']
        self._remove_order_level_data_from(item_dict)
        order_list.append({'so_number': sales_order, 'order_number': order_number,
                           'po_date': po_date, 'items': [item_dict]})

    def _remove_order_level_data_from(self, item_dict):
        del item_dict['order_number']
        del item_dict['so_number']
        del item_dict['po_date']

    @staticmethod
    def _get_matching_sales_order(order_dict):
        if not isinstance(order_dict['so_number'], basestring):
            return SalesOrder.objects.filter(order_number=order_dict['so_number'])
        return []

    def _is_summary_row(self, row):
        print '*' * 50, 'row = ', row, 'relevant data', self.RELEVANT_DATA.values(), '*' * 50
        for column in self.RELEVANT_DATA.values():
            if column != 'po_date' and row[column] is '':
                return True
        return False


class ConsigneeFacade(Facade):
    RELEVANT_DATA = {1: 'name', 3: 'customer_id'}

    def _create_record_from_dict(self, record_dict):
        consignee, _ = Consignee.objects.get_or_create(customer_id=record_dict['customer_id'],
                                                       name=record_dict['name'])
        return consignee


class ProgrammeFacade(Facade):
    RELEVANT_DATA = {2: 'name', 3: 'wbs_element_ex'}

    def _create_record_from_dict(self, record_dict):
        programme, _ = Programme.objects.get_or_create(wbs_element_ex=record_dict['wbs_element_ex'],
                                                       name=record_dict['name'])
        return programme
