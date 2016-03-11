from django.test import TestCase

from eums.services.exporter.supply_efficiency_report_csv_exporter import SupplyEfficiencyReportCSVExporter, \
    SUPPLY_EFFICIENCY_REPORT_TYPES
from eums.test.factories.system_settings_factory import SystemSettingsFactory


class SupplyEfficiencyReportCSVExporterTest(TestCase):
    def setUp(self):
        SystemSettingsFactory(district_label="District")
        self.fixed_header_cells = [
            'UNICEF\nValues ($)',
            'IP RECEIPT\nValues ($)',
            'IP RECEIPT\nConfirmed (%)',
            'IP RECEIPT\nTransit (days)',
            'IP DISTRIBUTION\nValues ($)',
            'IP DISTRIBUTION\nBalance ($)',
            'END USER RECEIPT\nValues ($)',
            'END USER RECEIPT\nConfirmed (%)',
            'END USER RECEIPT\nTransit (days)'
        ]
        self.__setup_stub_variables()

    def test_should_assemble_csv_data_for_delivery_type_report(self):
        exporter = SupplyEfficiencyReportCSVExporter('host_name', SUPPLY_EFFICIENCY_REPORT_TYPES.delivery)
        result_csv = exporter.assemble_csv_data([self.stub_es_service_response])
        expected_csv = [
            ["Delivery\nDate", "Delivery\nIP", "Delivery\nDistrict"] + self.fixed_header_cells,
            ['01-Dec-2015', 'WAKISO DHO', 'Wakiso', 2968, 2968, 100, 0, 0, 2968, 0, 0, 0]
        ]
        self.assertEqual(result_csv, expected_csv)

    def test_should_assemble_csv_data_for_item_type_report(self):
        exporter = SupplyEfficiencyReportCSVExporter('host_name', SUPPLY_EFFICIENCY_REPORT_TYPES.item)
        result_csv = exporter.assemble_csv_data([self.stub_es_service_response])
        expected_csv = [
            ["Item\nDescription", "Item\nMaterial Code"] + self.fixed_header_cells,
            ['Safety box f.used syrgs/ndls 5lt/BOX-25 E', 'SL062334', 2968, 2968, 100, 0, 0, 2968, 0, 0, 0]
        ]
        self.assertEqual(result_csv, expected_csv)

    def test_should_assemble_csv_data_for_outcome_type_report(self):
        exporter = SupplyEfficiencyReportCSVExporter('host_name', SUPPLY_EFFICIENCY_REPORT_TYPES.outcome)
        result_csv = exporter.assemble_csv_data([self.stub_es_service_response])
        expected_csv = [
            ["Outcome\nOutcome Name"] + self.fixed_header_cells,
            ['YI106 - PCR 2 KEEP CHILDREN LEARNING', 2968, 2968, 100, 0, 0, 2968, 0, 0, 0]
        ]
        self.assertEqual(result_csv, expected_csv)

    def test_should_assemble_csv_data_for_po_waybill_type_report(self):
        exporter = SupplyEfficiencyReportCSVExporter('host_name', SUPPLY_EFFICIENCY_REPORT_TYPES.po_waybill)
        result_csv = exporter.assemble_csv_data([self.stub_es_service_response])
        expected_csv = [
            ["PO / Waybill\nDoc. Number", "PO / Waybill\nType"] + self.fixed_header_cells,
            [201449, 'PO', 2968, 2968, 100, 0, 0, 2968, 0, 0, 0]
        ]
        self.assertEqual(result_csv, expected_csv)

    def test_should_assemble_csv_data_for_ip_type_report(self):
        exporter = SupplyEfficiencyReportCSVExporter('host_name', SUPPLY_EFFICIENCY_REPORT_TYPES.ip)
        result_csv = exporter.assemble_csv_data([self.stub_es_service_response])
        expected_csv = [
            ["Implementing Partner\nName"] + self.fixed_header_cells,
            ['WAKISO DHO', 2968, 2968, 100, 0, 0, 2968, 0, 0, 0]
        ]
        self.assertEqual(result_csv, expected_csv)

    def test_should_assemble_csv_data_for_location_type_report(self):
        exporter = SupplyEfficiencyReportCSVExporter('host_name', SUPPLY_EFFICIENCY_REPORT_TYPES.location)
        result_csv = exporter.assemble_csv_data([self.stub_es_service_response])
        expected_csv = [
            ["District\nDistrict Name"] + self.fixed_header_cells,
            ['Wakiso', 2968, 2968, 100, 0, 0, 2968, 0, 0, 0]
        ]
        self.assertEqual(result_csv, expected_csv)

    def __setup_stub_variables(self):
        self.stub_es_service_response = {
            "delivery_stages": {
                "end_user": {
                    "average_delay": 0,
                    "confirmed": 0,
                    "total_value_received": 0
                },
                "ip_receipt": {
                    "average_delay": 0,
                    "confirmed": 100,
                    "total_value_received": 2968
                },
                "unicef": {
                    "total_value": 2968
                },
                "ip_distribution": {
                    "total_value_distributed": 0,
                    "balance": 2968
                }
            },
            "identifier": {
                "ip": {
                    "name": "WAKISO DHO"
                },
                "delivery": {
                    "location": "Wakiso",
                    "delivery_date": "01-Dec-2015"
                },
                "location": "Wakiso",
                "order_item": {
                    "item": {
                        "material_code": "SL062334",
                        "description": "Safety box f.used syrgs/ndls 5lt/BOX-25 E"
                    },
                    "order": {
                        "order_number": 201449,
                        "order_type": "PO"
                    }
                },
                "delivery_date": "2015-12-01",
                "programme": {
                    "name": "YI106 - PCR 2 KEEP CHILDREN LEARNING"
                }
            }
        }
