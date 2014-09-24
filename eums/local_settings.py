from eums.settings import *

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'eums',
        'USER': 'postgres',
        'HOST': 'localhost',
        'PORT': '5432'
    }
}
