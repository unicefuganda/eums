from eums.elasticsearch.sync_info import SyncInfo
from eums.elasticsearch.synchroniser import run

SyncInfo.objects.all().delete()
run()
