import csv

from django.conf import settings
from django.core import mail

from eums import settings_export
from eums.celery import app
from eums.services.exporter.alert_csv_exporter import AlertCSVExporter
from eums.services.exporter.delivery_csv_exporter import DeliveryCSVExporter
from eums.services.exporter.delivery_feedback_report_csv_exporter import DeliveryFeedbackReportExporter
from eums.services.exporter.item_feedback_report_csv_exporter import ItemFeedbackReportExporter
from eums.services.exporter.stock_report_csv_exporter import StockReportExporter
from eums.services.exporter.supply_efficiency_report_csv_exporter import SupplyEfficiencyReportCSVExporter
from eums.util.contact_client import ContactClient


class CSVExportService(object):
    @classmethod
    def generate(cls, data, category, filename):
        file_location = settings_export.EXPORTS_DIR + category + '/' + filename
        export_file = open(file_location, 'wb')
        export_file.write('sep=,\n')
        wr = csv.writer(export_file, quoting=csv.QUOTE_ALL)
        wr.writerows(data)

    @classmethod
    def notify(cls, user, subject, message):
        message = message % user.username
        if getattr(user, 'email', None):
            mail.send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email])


@app.task
def generate_delivery_export_csv(user, delivery_type, host_name):
    csv_export_service = DeliveryCSVExporter.create_delivery_exporter_by_type(delivery_type.capitalize(), host_name)
    CSVExportService.generate(csv_export_service.assemble_csv_data(), csv_export_service.export_category,
                              csv_export_service.get_export_csv_file_name())

    CSVExportService.notify(user, *csv_export_service.notification_details())


@app.task
def generate_delivery_feedback_report(user, host_name, deliveries_feedback):
    deliveries_feedback_with_contact = map(set_remote_contact_to_report_item, deliveries_feedback)
    csv_export_service = DeliveryFeedbackReportExporter(host_name)

    CSVExportService.generate(csv_export_service.assemble_csv_data(deliveries_feedback_with_contact),
                              csv_export_service.export_category,
                              csv_export_service.get_export_csv_file_name())

    CSVExportService.notify(user, *csv_export_service.notification_details())


@app.task
def generate_item_feedback_report(user, host_name, items_feedback):
    items_feedback_with_contact = map(set_remote_contact_to_report_item, items_feedback)
    csv_export_service = ItemFeedbackReportExporter(host_name)
    CSVExportService.generate(csv_export_service.assemble_csv_data(items_feedback_with_contact),
                              csv_export_service.export_category,
                              csv_export_service.get_export_csv_file_name())

    CSVExportService.notify(user, *csv_export_service.notification_details())


@app.task
def generate_stock_feedback_report(user, host_name, stocks):
    csv_export_service = StockReportExporter(host_name)
    CSVExportService.generate(csv_export_service.assemble_csv_data(stocks),
                              csv_export_service.export_category,
                              csv_export_service.get_export_csv_file_name())

    CSVExportService.notify(user, *csv_export_service.notification_details())


@app.task
def generate_alert_export_csv(user, host_name, alerts, alert_type):
    csv_export_service = AlertCSVExporter(host_name, alert_type)
    CSVExportService.generate(csv_export_service.assemble_csv_data(alerts),
                              csv_export_service.export_category,
                              csv_export_service.get_export_csv_file_name())

    CSVExportService.notify(user, *csv_export_service.notification_details())


@app.task
def generate_supply_efficiency_report(user, host_name, supply_efficiency_items, supply_efficiency_type):
    csv_export_service = SupplyEfficiencyReportCSVExporter(host_name, supply_efficiency_type)
    CSVExportService.generate(csv_export_service.assemble_csv_data(supply_efficiency_items),
                              csv_export_service.export_category,
                              csv_export_service.get_export_csv_file_name())

    CSVExportService.notify(user, *csv_export_service.notification_details())


def set_remote_contact_to_report_item(report_item):
    contact = ContactClient.get(report_item.get('contactPersonId', report_item.get('contact_person_id')))
    report_item['contactName'] = '%s %s' % (contact.get('firstName'), contact.get('lastName'))
    report_item['contactPhone'] = contact.get('phone')
    return report_item
