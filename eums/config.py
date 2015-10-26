from django.apps import AppConfig
import sys


class EumsConfig(AppConfig):
 
    name = 'eums'
    verbose_name = 'EUMS'
 
    def ready(self):
        import eums.elasticsearch.delete_handlers
        if not 'test' in sys.argv:
            import eums.signals.handlers