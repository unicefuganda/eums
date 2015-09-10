import csv

from django.core import mail
from django.conf import settings

from eums.celery import app
from eums.services.delivery_csv_export import DeliveryExportFactory


class CSVExportService(object):

    @classmethod
    def generate(cls, data, filename):
        file_location = settings.EXPORTS_DIR + filename
        export_file = open(file_location, 'wb')
        wr = csv.writer(export_file, quoting=csv.QUOTE_ALL)
        wr.writerows(data)

    @classmethod
    def notify(cls, user, subject, message):
        message = message % user.first_name
        if getattr(user, 'email', None):
            mail.send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email])


@app.task
def generate_delivery_export_csv(user, delivery_type):
    csv_export_service = DeliveryExportFactory.create(delivery_type.capitalize())
    data = csv_export_service.data()
    CSVExportService.generate(data, csv_export_service.export_filename)
    CSVExportService.notify(user, *csv_export_service.notification_details())