from django.apps import AppConfig
import sys


class EumsConfig(AppConfig):
 
    name = 'eums'
    verbose_name = 'EUMS'
 
    def ready(self):
        if not 'test' in sys.argv:
            import eums.signals.handlers