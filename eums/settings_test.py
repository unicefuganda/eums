
from eums.settings import *

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'eums_test',
        'USER': 'postgres',
        'HOST': 'localhost',
        'PORT': '5432'
    }
}

CONTACTS_SERVICE_URL = 'http://localhost:9005/api/contacts/'
_es_settings = namedtuple('ES_SETTINGS', ['INDEX', 'NODE_TYPE', 'HOST', 'MAPPING', 'NODE_SEARCH', 'BULK'])
_base_url = 'http://localhost:9200/'
ELASTIC_SEARCH = _es_settings(
    'eums_test',
    'delivery_node',
    _base_url,
    '%s/_mapping' % _base_url,
    '%s/delivery_node/_search' % _base_url,
    '%s/_bulk' % _base_url,
    )

CELERY_LIVE = False
