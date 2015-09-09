import os
from unittest import TestCase

from django.test import override_settings
from mock import patch, MagicMock

from eums.models import DistributionPlanNode
from eums.services.csv_export_service import CSVExportService
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.delivery_factory import DeliveryFactory
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory
from eums.test.factories.item_factory import ItemFactory
from eums.test.factories.release_order_factory import ReleaseOrderFactory
from eums.test.factories.release_order_item_factory import ReleaseOrderItemFactory

DEFAULT_FROM_EMAIL = "hoho@ha.ha"
HOSTNAME = "ha.ha"
EMAIL_NOTIFICATION_CONTENT = "%s some content %s other content"


class ExportServiceTest(TestCase):

    def setUp(self):
        self.header = [
                'Waybill', 'Item Description', 'Material Code', 'Quantity Shipped', 'Shipment Date',
                'Implementing Partner', 'Contact Person', 'Contact Number', 'District', 'Is End User',
                'Is Tracked' ]

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

        row_one=[waybill, mama_kit, material_code, 10, delivery_date, consignee_name,
                '%s %s' % (contact['firstName'], contact['lastName']),
                contact['phone'], luweero, 'Yes', 'No']


        csv_exporter = CSVExportService('Waybill')

        expected_data = [self.header, row_one]
        data = csv_exporter.data()
        self.assertEqual(data, expected_data)
