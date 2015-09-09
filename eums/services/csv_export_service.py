import csv

from django.core import mail
from eums.models import ReleaseOrderItem
from eums.celery import app
from django.conf import settings
from eums.services.delivery_csv_export import DeliveryCSVExport


class CSVExportService(object):

    @classmethod
    def generate(cls, data, filename):
        file_location = settings.EXPORTS_DIR + filename
        export_file = open(file_location, 'wb')
        wr = csv.writer(export_file, quoting=csv.QUOTE_ALL)
        wr.writerows(data)

    @classmethod
    def notify(cls, user, subject, message):
        if getattr(user, 'email', None):
            mail.send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email])



@app.task
def generate_waybill_csv(user):
    csv_export_service = DeliveryCSVExport(ReleaseOrderItem.WAYBILL)
    data = csv_export_service.data()
    CSVExportService.generate(data, csv_export_service.FILENAME)
    CSVExportService.notify(user, *csv_export_service.notification_details())