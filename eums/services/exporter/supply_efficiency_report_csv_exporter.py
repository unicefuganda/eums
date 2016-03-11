from model_utils import Choices

from eums.services.exporter.report_csv_exporter import ReportExporter
from eums.services.system_settings_service import SystemSettingsService

SUPPLY_EFFICIENCY_REPORT_TYPES = Choices("delivery", "item", "outcome", "po_waybill", "ip", "location")


class SupplyEfficiencyReportCSVExporter(ReportExporter):
    def __init__(self, host_name, supply_efficiency_report_type):
        localized_report_type = supply_efficiency_report_type \
            if supply_efficiency_report_type != SUPPLY_EFFICIENCY_REPORT_TYPES.location \
            else self.__system_settings.district_label
        self.__supply_efficiency_report_type = supply_efficiency_report_type
        self.__system_settings = SystemSettingsService.get_system_settings()
        self.export_category = 'report/supply_efficiency'
        self.export_label = 'Supply Efficiency Report'
        self.file_name = 'supply_efficiency_report_(%s)' % localized_report_type.lower()
        super(SupplyEfficiencyReportCSVExporter, self).__init__(host_name)

    def config_headers(self):
        if self.__supply_efficiency_report_type == SUPPLY_EFFICIENCY_REPORT_TYPES.delivery:
            result = ["Delivery\nDate", "Delivery\nIP", ("Delivery\n" % self.__system_settings.district_label)]
        elif self.__supply_efficiency_report_type == SUPPLY_EFFICIENCY_REPORT_TYPES.item:
            result = ["Item\nDescription", "Item\nMaterial Code"]
        elif self.__supply_efficiency_report_type == SUPPLY_EFFICIENCY_REPORT_TYPES.outcome:
            result = ["Outcome\nOutcome Name"]
        elif self.__supply_efficiency_report_type == SUPPLY_EFFICIENCY_REPORT_TYPES.po_waybill:
            result = ["PO / Waybill\nDoc. Number", "PO / Waybill\nType"]
        elif self.__supply_efficiency_report_type == SUPPLY_EFFICIENCY_REPORT_TYPES.ip:
            result = ["Implementing Partner\nName"]
        elif self.__supply_efficiency_report_type == SUPPLY_EFFICIENCY_REPORT_TYPES.location:
            result = ["%s\n%s Name" % (self.__system_settings.district_label, self.__system_settings.district_label)]
        else:
            raise Exception("Invalid supply efficiency report type")

        return result + ['UNICEF\nValues ($)',
                         'IP RECEIPT\nValues ($)',
                         'IP RECEIPT\nConfirmed (%)',
                         'IP RECEIPT\nTransit (days)',
                         'IP DISTRIBUTION\nValues ($)',
                         'IP DISTRIBUTION\nBalance ($)',
                         'END USER RECEIPT\nValues ($)',
                         'END USER RECEIPT\nConfirmed (%)',
                         'END USER RECEIPT\nTransit (days)']

    def config_dic_date_keys(self):
        if self.__supply_efficiency_report_type == SUPPLY_EFFICIENCY_REPORT_TYPES.delivery:
            result = ["identifier.delivery.delivery_date", "identifier.ip.name", "identifier.delivery.location"]
        elif self.__supply_efficiency_report_type == SUPPLY_EFFICIENCY_REPORT_TYPES.item:
            result = ["identifier.order_item.item.description", "identifier.order_item.item.material_code"]
        elif self.__supply_efficiency_report_type == SUPPLY_EFFICIENCY_REPORT_TYPES.outcome:
            result = ["identifier.programme.name"]
        elif self.__supply_efficiency_report_type == SUPPLY_EFFICIENCY_REPORT_TYPES.po_waybill:
            result = ["identifier.order_item.order.order_number", "identifier.order_item.order.order_type"]
        elif self.__supply_efficiency_report_type == SUPPLY_EFFICIENCY_REPORT_TYPES.ip:
            result = ["identifier.ip.name"]
        elif self.__supply_efficiency_report_type == SUPPLY_EFFICIENCY_REPORT_TYPES.location:
            result = ["identifier.location"]
        else:
            raise Exception("Invalid supply efficiency report type")

        return result + ['delivery_stages.unicef.total_value',
                         'delivery_stages.ip_receipt.total_value_received',
                         'delivery_stages.ip_receipt.confirmed',
                         'delivery_stages.ip_receipt.average_delay',
                         'delivery_stages.ip_distribution.total_value_distributed',
                         'delivery_stages.ip_distribution.balance',
                         'delivery_stages.end_user.total_value_received',
                         'delivery_stages.end_user.confirmed',
                         'delivery_stages.end_user.average_delay']
