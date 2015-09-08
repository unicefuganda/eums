import os

def environ(name, default=None):
    var = os.getenv(name, default)

    if str(var).lower() == 'true':
        return True
    elif str(var).lower() == 'false':
        return False
    return var

BASE_DIR = os.path.dirname(os.path.dirname(__file__))

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = environ('DJANGO_SECRET_KEY', '3=$_20f=x$+*wp(xm07^8m-n=n2zy+w6hc7u985p@4$wad3q3t')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = environ('DJANGO_DEBUG', 'false')
TEMPLATE_DEBUG = DEBUG

ALLOWED_HOSTS = []

INSTALLED_APPS = (
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'bootstrap_pagination',
    'eums',
    'rest_framework',
    'password_reset',
    'django_extensions',
    'test_without_migrations'
)

MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.auth.middleware.SessionAuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'bootstrap_pagination.middleware.PaginationMiddleware',
)

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': environ('PG_DATABASE_NAME', 'postgres'),
        'USER': environ('PG_USERNAME', 'postgres'),
        'HOST': environ('PG_PASSWORD', 'postgres'),
        'PORT': '5432'
    }
}

ROOT_URLCONF = 'eums.urls'

WSGI_APPLICATION = 'eums.wsgi.application'

LANGUAGE_CODE = 'en-gb'

TIME_ZONE = 'Africa/Kampala'

USE_I18N = True

USE_L10N = True

TEMPLATE_DIRS = (os.path.join(BASE_DIR, 'eums/templates'),)

FILE_UPLOAD_MAX_MEMORY_SIZE = 26214400

TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',
)

STATICFILES_DIRS = (os.path.join(BASE_DIR, 'eums/client'),)

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'

# Number of days after expected delivery date after which messages to consignees are sent out
DELIVERY_STATUS_CHECK_DELAY = environ('DELIVERY_STATUS_CHECK_DELAY', 7)

# Expiry time (days) for a scheduled flow ** This should match the one set in rapid pro! and has a max value of 30 days
MAX_ALLOWED_REPLY_PERIOD = 7

# Buffer time in case run is scheduled for immediate delivery (due to node not being saved immediately on delivery)
DELIVERY_BUFFER_IN_SECONDS = 10

# Contacts service settings
import os

CONTACTS_SERVICE_URL = environ('CONTACTS_SERVICE_URL', 'http://localhost:8005/api/contacts/')

# RapidPro settings
RAPIDPRO_API_TOKEN = environ('RAPIDPRO_API_TOKEN', 'invalid_token_if_no_token')
RAPIDPRO_URL = environ('https://app.rapidpro.io/api/v1/')
RAPIDPRO_URLS = {
    'FLOWS': "%sflows.json" % RAPIDPRO_URL,
    'RUNS': "%sruns.json" % RAPIDPRO_URL
}
RAPIDPRO_EXTRAS = {'CONTACT_NAME': 'contactName', 'SENDER': 'sender', 'PRODUCT': 'product'}

# WARNING: Never turn this on unless it is a live instance of the app (Staging or Prod. Not Dev, Test, or QA).
RAPIDPRO_LIVE = environ('RAPIDPRO_LIVE', 'false')

LOGIN_REDIRECT_URL = "/"

LOGIN_URL = "/login"

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': ('rest_framework.permissions.IsAuthenticated',),
    'DEFAULT_FILTER_BACKENDS': ('rest_framework.filters.DjangoFilterBackend', 'rest_framework.filters.SearchFilter')
}

EMAIL_BACKEND = 'django_mailgun.MailgunBackend'
MAILGUN_ACCESS_KEY = environ('MAILGUN_ACCESS_KEY', '')
MAILGUN_SERVER_NAME = environ('MAILGUN_SERVER_NAME','sandbox6c2b4eb4198643d5be6e7d696f7309ae.mailgun.org')
MAILGUN_SENDER = environ('MAILGUN_SENDER', "UNICEF EUM <postmaster@sandbox6c2b4eb4198643d5be6e7d696f7309ae.mailgun.org>")

HOSTNAME = 'eums.unicefuganda.org'
DEFAULT_FROM_EMAIL = 'admin@eums.unicefuganda.org'

LOGGING_CONFIG = None
LOGGING = {
    'version': 1,
    'disable_existing_loggers': True,
    'formatters': {
        'standard': {
            'format': "[%(asctime)s] %(levelname)s [%(name)s:%(lineno)s] %(message)s",
            'datefmt': "%d/%b/%Y %H:%M:%S"
        },
    },
    'handlers': {
        'null': {
            'level': 'INFO',
            'class': 'django.utils.log.NullHandler',
        },
        'file': {
            'level': 'INFO',
            'class': 'logging.handlers.WatchedFileHandler',
            'filename': "debug.log",
            'formatter': 'standard',
            'mode': 'a'
        },
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'standard'
        },
    },
    'loggers': {
        '': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': True
        },
    }
}

import logging.config

logging.config.dictConfig(LOGGING)

try:
    from export_settings import *
    from local_settings import *
except ImportError:
    pass
