from eums.settings import *

CELERY_LIVE = True
RAPIDPRO_URL = 'https://rapidpro.local/api/v1/'
RAPIDPRO_API_TOKEN = '480678988e664cd927d7f9a9a32822316567ed5e'
RAPIDPRO_SSL_VERIFY = False
RAPIDPRO_LIVE = True

RAPIDPRO_URLS.update({
    'CONTACTS': "%scontacts.json" % RAPIDPRO_URL,
})
