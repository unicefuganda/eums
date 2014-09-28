
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
    'eums',
    'rest_framework'
)

MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.auth.middleware.SessionAuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
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

STATICFILES_DIRS = (os.path.join(BASE_DIR, 'eums/client'),)

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'

# Number of days after expected delivery date after which messages to consignees are sent out
DELIVERY_STATUS_CHECK_DELAY = 7

# Contacts service settings
CONTACTS_SERVICE_URL = 'http://localhost:8005/api/contacts/'

# RapidPro settings
RAPIDPRO_API_TOKEN = os.environ['RAPIDPRO_API_TOKEN']
RAPIDPRO_URL = 'https://rapidpro.io/api/v1/'
RAPIDPRO_FLOW_ID = 2436
RAPIDPRO_URLS = {
    'FLOWS': "%sflows.json" % RAPIDPRO_URL,
    'RUNS': "%sruns.json" % RAPIDPRO_URL
}
RAPIDPRO_EXTRAS = {'CONTACT_NAME': 'contactName', 'SENDER': 'sender', 'PRODUCT': 'product'}

# WARNING: Never turn this on unless it is a live instance of the app (Staging or Prod. Not Dev, Test, or QA).
RAPIDPRO_LIVE = False
