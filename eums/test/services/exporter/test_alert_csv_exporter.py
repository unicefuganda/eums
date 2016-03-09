import datetime
from decimal import Decimal

from django.test import TestCase
from mock import PropertyMock, patch

from eums.models import Alert
from eums.services.exporter.alert_csv_exporter import AlertCSVExporter
from eums.test.factories.alert_factory import AlertFactory
from eums.test.factories.delivery_factory import DeliveryFactory
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory
from eums.test.helpers.fake_datetime import FakeDate


class AlertCSVExporterTest(TestCase):
    def setUp(self):
        self.item_alert = AlertFactory(order_number=81020737,
                                       item_description='Microsoft windows 7 Proefessional OLP NL F',
                                       issue=Alert.ISSUE_TYPES.not_received,
                                       is_resolved=False,
                                       remarks='Operating system',
                                       consignee_name='WAKISO DHO',
                                       runnable=DeliveryNodeFactory())
        self.delivery_alert = AlertFactory(order_number=81025778,
                                           item_description='Safety box f.used syrgs/ndls 5lt/BOX-25 B',
                                           issue=Alert.ISSUE_TYPES.damaged,
                                           is_resolved=False,
                                           remarks='Goods',
                                           consignee_name='MUBENDE DHO',
                                           runnable=DeliveryFactory())
        self.distribution_alert = AlertFactory(order_number=81034568,
                                               item_description='IEHK2006,kit,suppl.1-drugs',
                                               issue=Alert.ISSUE_TYPES.distribution_expired,
                                               is_resolved=False,
                                               remarks='Medicine',
                                               consignee_name='NAPAK DHO',
                                               runnable=DeliveryFactory())

    def test_should_assemble_csv_data_for_item_alert(self):
        with patch('eums.models.alert.Alert.contact', new_callable=PropertyMock) as mock_contact:
            mock_contact.return_value = {'contact_name': 'James Harden', 'contact_phone': '+256771234567'}
            exporter = AlertCSVExporter('host_name', 'item')
            alert_by_item_csv = exporter.assemble_csv_data([self.item_alert])
            expected_csv = [
                ['STATUS', 'ALERT DATE', 'PO/WAYBILL', 'DATE SHIPPED', 'QTY', 'VALUE', 'ITEM', 'REPORTED BY',
                 'IMPLEMENTING PARTNER', 'DISTRICT', 'UNICEF REMARKS', 'RESOLVED'],
                ['Not Received', datetime.date(2016, 3, 9), 81020737, FakeDate(2014, 9, 25), 10, Decimal('100'),
                 'Microsoft windows 7 Proefessional OLP NL F', 'James Harden\n+256771234567', 'WAKISO DHO', 'Kampala',
                 'Operating system', False]]

            self.assertEqual(alert_by_item_csv, expected_csv)

    def test_should_assemble_csv_data_for_delivery_alert(self):
        with patch('eums.models.alert.Alert.contact', new_callable=PropertyMock) as mock_contact:
            mock_contact.return_value = {'contact_name': 'Stephen Curry', 'contact_phone': '+256777654321'}
            exporter = AlertCSVExporter('host_name', 'delivery')
            alert_by_delivery_csv = exporter.assemble_csv_data([self.delivery_alert])
            expected_csv = [
                ['STATUS', 'ALERT DATE', 'PO/WAYBILL', 'DATE SHIPPED', 'VALUE', 'REPORTED BY', 'IMPLEMENTING PARTNER',
                 'DISTRICT', 'UNICEF REMARKS', 'RESOLVED', 'RETRIGGERED'],
                ['Damaged', datetime.date(2016, 3, 9), 81025778, datetime.date(2016, 3, 9), 0,
                 'Stephen Curry\n+256777654321', 'MUBENDE DHO', 'Kampala', 'Goods', False, False]]

            self.assertEqual(alert_by_delivery_csv, expected_csv)

    def test_should_assemble_csv_data_for_distribution_alert(self):
        with patch('eums.models.alert.Alert.date_received', new_callable=PropertyMock) as mock_date_received:
            mock_date_received.return_value = FakeDate.today()

            with patch('eums.models.alert.Alert.contact', new_callable=PropertyMock) as mock_contact:
                mock_contact.return_value = {'contact_name': 'Lebron James', 'contact_phone': '+256776666666'}

                exporter = AlertCSVExporter('host_name', 'distribution')
                alert_by_distribution_csv = exporter.assemble_csv_data([self.distribution_alert])
                expected_csv = [
                    ['DISTRIBUTION DEADLINE', 'PO/WAYBILL', 'DATE SHIPPED', 'DATE RECEIVED', 'VALUE', 'REPORTED BY',
                     'IMPLEMENTING PARTNER', 'DISTRICT', 'UNICEF REMARKS', 'RESOLVED'],
                    [datetime.date(2016, 3, 9), 81034568, datetime.date(2016, 3, 9), FakeDate(2014, 9, 25), 0,
                     'Lebron James\n+256776666666', 'NAPAK DHO', 'Kampala', 'Medicine', False]]

                self.assertEqual(alert_by_distribution_csv, expected_csv)
