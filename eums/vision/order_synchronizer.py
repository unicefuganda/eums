import datetime
import json
from abc import abstractmethod, ABCMeta

from eums.utils import all_relevant_data_contained, \
    get_index_of_particular_element_in_complex_list
from eums.vision.vision_data_synchronizer import VisionDataSynchronizer, VisionException


class OrderSynchronizer(VisionDataSynchronizer):
    __metaclass__ = ABCMeta

    def __init__(self, mapping_template, base_url, start_date='', end_date=''):
        if not start_date:
            raise VisionException(message="'start' date is required")

        if not mapping_template:
            raise VisionException(message='Mapping template is required')

        self.mapping_template = mapping_template

        end_date = end_date if end_date else datetime.date.today().strftime('%d%m%Y')
        super(OrderSynchronizer, self).__init__(self._get_url(base_url, start_date, end_date))

    @abstractmethod
    def _append_new_order(self, record, order_number, orders):
        pass

    @abstractmethod
    def _append_new_item(self, record, order_index, orders):
        pass

    @abstractmethod
    def _get_or_create_new_order(self, order):
        pass

    @abstractmethod
    def _update_or_create_new_item(self, item, order):
        pass

    def _get_json(self, data):
        # the data got from web service is a string of string
        return [] if data == self.NO_DATA_MESSAGE else json.loads(data)

    def _convert_records(self, records):
        orders = []
        for record in records:
            filtered_record = self.filter_relevant_value(self.mapping_template, record)

            if all_relevant_data_contained(filtered_record, self.mapping_template.values()):
                order_number = filtered_record['order_number']
                order_index = get_index_of_particular_element_in_complex_list(orders, {'order_number': order_number})
                if self._is_new_order(order_index):
                    self._append_new_order(filtered_record, order_number, orders)
                else:
                    self._append_new_item(filtered_record, order_index, orders)

        return orders

    def _save_records(self, records):
        for record in records:
            new_order = self._get_or_create_new_order(record)
            if new_order:
                for item in record['items']:
                    self._update_or_create_new_item(item, new_order)

    @staticmethod
    def _get_url(base_url, start_date, end_date):
        return base_url + start_date + '/' + end_date

    @staticmethod
    def _index_in_list(number, order_list):
        for index, order in enumerate(order_list):
            if order.get('order_number') == number:
                return index
        return -1

    @staticmethod
    def _is_new_order(order_index):
        return order_index <= -1
