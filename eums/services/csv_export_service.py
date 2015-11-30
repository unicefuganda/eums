import csv
from django.core import mail
from django.conf import settings
from eums.celery import app
from eums.services.delivery_csv_export import DeliveryCSVExport
from eums.services.delivery_feedback_report_csv_export import DeliveryFeedbackReportExport
from eums.services.item_feedback_report_csv_export import ItemFeedbackReportExport


class CSVExportService(object):
    @classmethod
    def generate(cls, data, filename):
        file_location = settings.EXPORTS_DIR + filename
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
    csv_export_service = DeliveryCSVExport.make_delivery_export_by_type(delivery_type.capitalize(), host_name)
    CSVExportService.generate(csv_export_service.assemble_csv_data(),
                              csv_export_service.export_filename)
    CSVExportService.notify(user, *csv_export_service.notification_details())


@app.task
def generate_delivery_feedback_report_export_csv(user, host_name, deliveries_feedback):
    csv_export_service = DeliveryFeedbackReportExport(host_name)
    CSVExportService.generate(csv_export_service.assemble_csv_data(deliveries_feedback),
                              csv_export_service.export_filename)
    # CSVExportService.notify(user, *csv_export_service.notification_details())


@app.task
def generate_item_feedback_report_export_csv(user, host_name, items_feedback):
    csv_export_service = ItemFeedbackReportExport(host_name)
    CSVExportService.generate(csv_export_service.assemble_csv_data(items_feedback),
                              csv_export_service.export_filename)
    # CSVExportService.notify(user, *csv_export_service.notification_details())
