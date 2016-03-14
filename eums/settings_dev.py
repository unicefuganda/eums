from eums.settings import *

RAPIDPRO_URL = 'https://rapidpro.local/api/v1/'
RAPIDPRO_API_TOKEN = '9e85c932516e7390f95aedd0ac007f149c69ac18'
RAPIDPRO_SSL_VERIFY = False
RAPIDPRO_LIVE = True

RAPIDPRO_URLS.update({
    'CONTACTS': "%scontacts.json" % RAPIDPRO_URL,
})
