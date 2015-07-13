import os

BASE_DIR = os.path.dirname(os.path.dirname(__file__))

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = '3=$_20f=x$+*wp(xm07^8m-n=n2zy+w6hc7u985p@4$wad3q3t'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

TEMPLATE_DEBUG = True

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
    'django_extensions'
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
        'NAME': 'eums',
        'USER': 'postgres',
        'HOST': 'localhost',
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
DELIVERY_STATUS_CHECK_DELAY = 7

# Expiry time (days) for a scheduled flow ** This should match the one set in rapid pro! and has a max value of 30 days
MAX_ALLOWED_REPLY_PERIOD = 7


# Contacts service settings
import os
try:
    CONTACTS_SERVICE_URL = os.environ['LOCAL_HOST_HTTP_URL'] + ':8005/api/contacts/'
except KeyError:
    CONTACTS_SERVICE_URL = 'http://localhost:8005/api/contacts/'

# RapidPro settings
# TODO figure out a way to use environment variable with supervisor
token = 'token'
RAPIDPRO_API_TOKEN = os.getenv('RAPIDPRO_API_TOKEN', token)
RAPIDPRO_URL = 'https://rapidpro.io/api/v1/'
RAPIDPRO_URLS = {
    'FLOWS': "%sflows.json" % RAPIDPRO_URL,
    'RUNS': "%sruns.json" % RAPIDPRO_URL
}
RAPIDPRO_EXTRAS = {'CONTACT_NAME': 'contactName', 'SENDER': 'sender', 'PRODUCT': 'product'}

# WARNING: Never turn this on unless it is a live instance of the app (Staging or Prod. Not Dev, Test, or QA).
RAPIDPRO_LIVE = False

LOGIN_REDIRECT_URL = "/"

LOGIN_URL = "/login"

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': ('rest_framework.permissions.IsAuthenticated',),
    'DEFAULT_FILTER_BACKENDS': ('rest_framework.filters.DjangoFilterBackend', 'rest_framework.filters.SearchFilter')
}

EMAIL_BACKEND = 'django_mailgun.MailgunBackend'
MAILGUN_ACCESS_KEY = os.getenv('MAILGUN_ACCESS_KEY', '')
MAILGUN_SERVER_NAME = 'sandbox6c2b4eb4198643d5be6e7d696f7309ae.mailgun.org'
MAILGUN_SENDER = "UNICEF EUM <postmaster@sandbox6c2b4eb4198643d5be6e7d696f7309ae.mailgun.org>"


try:
    from local_settings import *
except ImportError:
    pass