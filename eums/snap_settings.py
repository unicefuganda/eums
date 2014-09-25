from eums.settings import *

DATABASES = {
   "default": {
       "ENGINE": "django.db.backends.postgresql_psycopg2",
       "NAME": "app_test",
       "USER": "go",
       "PASSWORD": "go",
       "HOST": "localhost",
   }
}

# Number of days after expected delivery date after which messages to consignees are sent out
DELIVERY_STATUS_CHECK_DELAY = 7

# Contacts service settings
CONTACTS_SERVICE_URL = 'http://localhost:8005/api/contacts/'

# RapidPro settings
RAPIDPRO_URL = 'https://rapidpro.io/api/v1/'
RAPIDPRO_FLOW_ID = 2436
RAPIDPRO_URLS = {
    'FLOW': "%sflows.json?id=%d" % (RAPIDPRO_URL, RAPIDPRO_FLOW_ID),
    'RUNS': "%sruns.json" % RAPIDPRO_URL
}
RAPIDPRO_EXTRAS = {'CONTACT_NAME': 'contactName', 'SENDER': 'sender', 'PRODUCT': 'product'}