from os.path import join

from eums.settings import BASE_DIR

EXPORTS_DIR = join(BASE_DIR, 'eums/client/exports/')

CSV_EXPIRED_HOURS = 24
DEFAULT_EXPIRED_SECONDS = CSV_EXPIRED_HOURS * 60 * 60

EMAIL_COMMON_SUBJECT = 'Your EUMS export file is ready'

EMAIL_NOTIFICATION_CONTENT = """
Dear %s,

Your export for {0} is ready.
You can download your Excel file here:
{1}
Please note that the link will expire after 24 hours.
Thank you,
The EUMs team.
"""

