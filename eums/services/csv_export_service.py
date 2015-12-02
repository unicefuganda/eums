import csv
from django.conf import settings
from django.core import mail

from eums import export_settings
from eums.celery import app
from eums.services.exporter.delivery_csv_exporter import DeliveryCSVExporter
from eums.services.exporter.delivery_feedback_report_csv_exporter import DeliveryFeedbackReportExporter
from eums.services.exporter.item_feedback_report_csv_exporter import ItemFeedbackReportExporter


class CSVExportService(object):
    @classmethod
    def generate(cls, data, category, filename):
        file_location = export_settings.EXPORTS_DIR + category + '/' + filename
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
                              csv_export_service.generate_exported_csv_file_name())

    CSVExportService.notify(user, *csv_export_service.notification_details())


@app.task
def generate_delivery_feedback_report(user, host_name, deliveries_feedback):
    csv_export_service = DeliveryFeedbackReportExporter(host_name)
    CSVExportService.generate(csv_export_service.assemble_csv_data(deliveries_feedback),
                              csv_export_service.export_category,
                              csv_export_service.generate_exported_csv_file_name())

    CSVExportService.notify(user, *csv_export_service.notification_details())


@app.task
def generate_item_feedback_report(user, host_name, items_feedback):
    csv_export_service = ItemFeedbackReportExporter(host_name)
    CSVExportService.generate(csv_export_service.assemble_csv_data(items_feedback),
                              csv_export_service.export_category,
                              csv_export_service.generate_exported_csv_file_name())

    CSVExportService.notify(user, *csv_export_service.notification_details())
