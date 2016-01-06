from eums.elasticsearch.sync_info import SyncInfo
from eums.elasticsearch.synchroniser import run


def reset_elastic_search_data_source():
    SyncInfo.objects.all().delete()
    run()


reset_elastic_search_data_source()
