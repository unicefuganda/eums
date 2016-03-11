from model_utils import Choices

from eums.services.exporter.report_csv_exporter import ReportExporter
from eums.services.system_settings_service import SystemSettingsService

SUPPLY_EFFICIENCY_REPORT_TYPES = Choices("delivery", "item", "outcome", "po_waybill", "ip", "location")


class SupplyEfficiencyReportCSVExporter(ReportExporter):
    def __init__(self, host_name, supply_efficiency_report_type):
        self.__supply_efficiency_report_type = supply_efficiency_report_type
        self.__system_settings = SystemSettingsService.get_system_settings()
        self.export_category = 'report/supply_efficiency'
        self.export_label = 'Supply Efficiency Report'
        localized_report_type = supply_efficiency_report_type \
            if supply_efficiency_report_type != SUPPLY_EFFICIENCY_REPORT_TYPES.location \
            else self.__system_settings.district_label
        self.file_name = 'supply_efficiency_report_(%s)' % localized_report_type.lower()
        super(SupplyEfficiencyReportCSVExporter, self).__init__(host_name)

    def config_headers(self):
        header_cells_map = {
            SUPPLY_EFFICIENCY_REPORT_TYPES.delivery:
                ["Delivery\nDate", "Delivery\nIP", ("Delivery\n%s" % self.__system_settings.district_label)],
            SUPPLY_EFFICIENCY_REPORT_TYPES.item:
                ["Item\nDescription", "Item\nMaterial Code"],
            SUPPLY_EFFICIENCY_REPORT_TYPES.outcome:
                ["Outcome\nOutcome Name"],
            SUPPLY_EFFICIENCY_REPORT_TYPES.po_waybill:
                ["PO / Waybill\nDoc. Number", "PO / Waybill\nType"],
            SUPPLY_EFFICIENCY_REPORT_TYPES.ip:
                ["Implementing Partner\nName"],
            SUPPLY_EFFICIENCY_REPORT_TYPES.location:
                ["%s\n%s Name" % (self.__system_settings.district_label, self.__system_settings.district_label)],
        }
        return header_cells_map.get(self.__supply_efficiency_report_type, []) + [
            'UNICEF\nValues ($)',
            'IP RECEIPT\nValues ($)',
            'IP RECEIPT\nConfirmed (%)',
            'IP RECEIPT\nTransit (days)',
            'IP DISTRIBUTION\nValues ($)',
            'IP DISTRIBUTION\nBalance ($)',
            'END USER RECEIPT\nValues ($)',
            'END USER RECEIPT\nConfirmed (%)',
            'END USER RECEIPT\nTransit (days)']

    def config_dic_date_keys(self):
        row_value_keys_map = {
            SUPPLY_EFFICIENCY_REPORT_TYPES.delivery:
                ["identifier.delivery.delivery_date", "identifier.ip.name", "identifier.delivery.location"],
            SUPPLY_EFFICIENCY_REPORT_TYPES.item:
                ["identifier.order_item.item.description", "identifier.order_item.item.material_code"],
            SUPPLY_EFFICIENCY_REPORT_TYPES.outcome:
                ["identifier.programme.name"],
            SUPPLY_EFFICIENCY_REPORT_TYPES.po_waybill:
                ["identifier.order_item.order.order_number", "identifier.order_item.order.order_type"],
            SUPPLY_EFFICIENCY_REPORT_TYPES.ip:
                ["identifier.ip.name"],
            SUPPLY_EFFICIENCY_REPORT_TYPES.location:
                ["identifier.location"],
        }
        return row_value_keys_map.get(self.__supply_efficiency_report_type, []) + [
            'delivery_stages.unicef.total_value',
            'delivery_stages.ip_receipt.total_value_received',
            'delivery_stages.ip_receipt.confirmed',
            'delivery_stages.ip_receipt.average_delay',
            'delivery_stages.ip_distribution.total_value_distributed',
            'delivery_stages.ip_distribution.balance',
            'delivery_stages.end_user.total_value_received',
            'delivery_stages.end_user.confirmed',
            'delivery_stages.end_user.average_delay']
