from eums.settings import *

RAPIDPRO_LIVE = True
DEBUG = False
TEMPLATE_DEBUG = False

CONTACTS_SERVICE_URL = 'http://eum.unicefuganda.org/contacts/'

_base_url = 'http://eum.unicefuganda.org'
_es_settings = namedtuple('ES_SETTINGS', ['INDEX', 'NODE_TYPE', 'HOST', 'MAPPING', 'NODE_SEARCH', 'BULK'])

ELASTIC_SEARCH = _es_settings(
        'eums',
        'delivery_node',
        _base_url,
        '%s/_mapping' % _base_url,
        '%s/delivery_node/_search' % _base_url,
        '%s/_bulk' % _base_url,
)