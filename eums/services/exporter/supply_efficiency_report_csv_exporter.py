from model_utils import Choices

from eums.services.exporter.report_csv_exporter import ReportExporter

SUPPLY_EFFICIENCY_REPORT_TYPES = Choices("delivery", "item", "outcome", "po_waybill", "ip", "location")


class SupplyEfficiencyReportExporter(ReportExporter):
    def __init__(self, host_name, supply_efficiency_report_type):
        self.supply_efficiency_report_type = supply_efficiency_report_type
        self.export_category = 'report/supply_efficiency'
        self.export_label = 'Supply Efficiency Report'
        self.file_name = 'supply_efficiency_report_(%s)' % self.supply_efficiency_report_type
        super(SupplyEfficiencyReportExporter, self).__init__(host_name)

    def config_headers(self):
        result = []
        if self.supply_efficiency_report_type == SUPPLY_EFFICIENCY_REPORT_TYPES.delivery:
            result = ["Delivery\nDate", "Delivery\nIP", "Delivery\nDistrict"]
        elif self.supply_efficiency_report_type == SUPPLY_EFFICIENCY_REPORT_TYPES.item:
            result = ["Item\nDescription", "Item\nMaterial Code"]
        elif self.supply_efficiency_report_type == SUPPLY_EFFICIENCY_REPORT_TYPES.outcome:
            result = ["Outcome\nOutcome Name"]
        elif self.supply_efficiency_report_type == SUPPLY_EFFICIENCY_REPORT_TYPES.po_waybill:
            result = ["PO / Waybill\nDoc. Number", "PO / Waybill\nType"]
        elif self.supply_efficiency_report_type == SUPPLY_EFFICIENCY_REPORT_TYPES.ip:
            result = ["Implementing Partner\nName"]
        elif self.supply_efficiency_report_type == SUPPLY_EFFICIENCY_REPORT_TYPES.location:
            result = ["District\nDistrict Name"]
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
        result = []
        if self.supply_efficiency_report_type == SUPPLY_EFFICIENCY_REPORT_TYPES.delivery:
            result = ["identifier.delivery.delivery_date", "identifier.ip.name", "identifier.delivery.location"]
        elif self.supply_efficiency_report_type == SUPPLY_EFFICIENCY_REPORT_TYPES.item:
            result = ["identifier.order_item.item.description", "identifier.order_item.item.material_code"]
        elif self.supply_efficiency_report_type == SUPPLY_EFFICIENCY_REPORT_TYPES.outcome:
            result = ["identifier.programme.name"]
        elif self.supply_efficiency_report_type == SUPPLY_EFFICIENCY_REPORT_TYPES.po_waybill:
            result = ["identifier.order_item.order.order_number", "identifier.order_item.order.order_type"]
        elif self.supply_efficiency_report_type == SUPPLY_EFFICIENCY_REPORT_TYPES.ip:
            result = ["identifier.ip.name"]
        elif self.supply_efficiency_report_type == SUPPLY_EFFICIENCY_REPORT_TYPES.location:
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
