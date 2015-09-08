import ast
from django.test import override_settings
import os
from unittest import TestCase
from eums.models import DistributionPlanNode

from eums.services.csv_export_service import CSV_Export_Service

from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.delivery_factory import DeliveryFactory
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory
from eums.test.factories.item_factory import ItemFactory
from eums.test.factories.release_order_factory import ReleaseOrderFactory
from eums.test.factories.release_order_item_factory import ReleaseOrderItemFactory
from mock import patch


class ExportServiceTest(TestCase):
    def tearDown(self):
        DistributionPlanNode.objects.all().delete()

    @patch('eums.models.DistributionPlanNode.build_contact')
    def test_should_get_export_list_for_warehouse(self, mock_build_contact):
        contact = {'firstName': 'John', 'lastName': 'Ssenteza', 'phone': '+256 782 123456'}
        mock_build_contact.return_value = contact

        delivery = DeliveryFactory(track=True)
        consignee_name = 'the consignee'
        consignee = ConsigneeFactory(name=consignee_name)
        waybill = 5404939
        mama_kit = 'Mama kit'
        material_code = 'Code 30'
        ro_item = ReleaseOrderItemFactory(item=ItemFactory(description=mama_kit, material_code=material_code),
                                          release_order=ReleaseOrderFactory(waybill=waybill))
        delivery_date = '2015-09-06'
        luweero = 'Luweero'
        DeliveryNodeFactory(distribution_plan=delivery, delivery_date=delivery_date,
                            consignee=consignee, item=ro_item, location=luweero)

        expected_data = [
            [
                'Waybill', 'Item Description', 'Material Code', 'Quantity Shipped', 'Shipment Date',
                'Implementing Partner', 'Contact Person', 'Contact Number', 'District', 'Is End User',
                'Is Tracked'
            ],
            [
                waybill, mama_kit, material_code, 10, delivery_date, consignee_name,
                '%s %s' % (contact['firstName'], contact['lastName']),
                contact['phone'], luweero, 'Yes', 'No'
            ]
        ]

        csv_exporter = CSV_Export_Service('Waybill')

        data = csv_exporter.data()
        self.assertEqual(data, expected_data)

    @override_settings(CELERY_ALWAYS_EAGER=True)
    @patch('eums.services.csv_export_service.generate_waybill_csv')
    def test_should_generate_csv(self, mock_build_contact):
        contact = {'firstName': 'John', 'lastName': 'Ssenteza', 'phone': '+256 782 123456'}
        mock_build_contact.return_value = contact

        delivery = DeliveryFactory(track=True)
        consignee_name = 'the consignee'
        consignee = ConsigneeFactory(name=consignee_name)
        waybill = 5404939
        mama_kit = 'Mama kit'
        material_code = 'Code 31'
        ro_item = ReleaseOrderItemFactory(item=ItemFactory(description=mama_kit, material_code=material_code),
                                          release_order=ReleaseOrderFactory(waybill=waybill))
        delivery_date = '2015-09-06'
        luweero = 'Luweero'
        DeliveryNodeFactory(distribution_plan=delivery, delivery_date=delivery_date,
                            consignee=consignee, item=ro_item, location=luweero)

        expected_data = [
            [
                'Waybill', 'Item Description', 'Material Code', 'Quantity Shipped', 'Shipment Date',
                'Implementing Partner', 'Contact Person', 'Contact Number', 'District', 'Is End User',
                'Is Tracked'
            ],
            [
                str(waybill), mama_kit, material_code, '10', delivery_date, consignee_name,
                '%s %s' % (contact['firstName'], contact['lastName']),
                contact['phone'], luweero, 'Yes', 'No'
            ]
        ]

        csv_exporter = CSV_Export_Service('Waybill')
        csv_exporter.generate.delay()

        csv_filename = 'warehouse_deliveries.csv'
        actual_data = self._read_csv(csv_filename)
        self.assertEqual(actual_data, expected_data)

        self.remove_csv_file(csv_filename)

    def _read_csv(self, filename):
        file_ = open(filename, 'r')
        lines = file_.readlines()
        return [list(eval(line.strip())) for line in lines]

    def remove_csv_file(self, filename):
        os.remove(filename)