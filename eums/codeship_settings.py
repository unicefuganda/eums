from eums.settings import *

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql_psycopg2",
        "NAME": "test",
        "USER": os.environ['PG_USER'],
        "PASSWORD": os.environ['PG_PASSWORD'],
        "HOST": "127.0.0.1",
    }
}
