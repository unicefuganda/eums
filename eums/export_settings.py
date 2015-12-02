from os.path import join

from eums.settings import BASE_DIR

EXPORTS_DIR = join(BASE_DIR, 'eums/client/exports/')

CSV_EXPIRED_HOURS = 24
DEFAULT_EXPIRED_SECONDS = CSV_EXPIRED_HOURS * 60 * 60


EMAIL_NOTIFICATION_CONTENT = """
Dear %s,

You have requested to exporter all {0} deliveries.
Please download it through the following link:
{1}

Thank you.
"""
