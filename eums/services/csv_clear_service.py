import os
import time
from celery.schedules import crontab
from celery.task import periodic_task
from eums.export_settings import *


class CSVClearService(object):
    @classmethod
    def config_clear_dir_expired_time_map(cls):
        csv_clear_dirs_expired_time_map = {
            CSVClearService.__absolute_category_path('report/feedback'): 1 * 60 * 60
        }
        return csv_clear_dirs_expired_time_map

    @classmethod
    def __absolute_category_path(cls, category):
        return join(EXPORTS_DIR, category)

    @classmethod
    def clear_expired_files(cls):
        clear_dirs_expired_time_map = CSVClearService.config_clear_dir_expired_time_map()
        for directory in clear_dirs_expired_time_map.keys():
            CSVClearService.__clear_files_by_directory(directory, clear_dirs_expired_time_map.get(directory))

    @classmethod
    def __clear_files_by_directory(cls, directory, expired_seconds=DEFAULT_EXPIRED_SECONDS):
        if not os.path.exists(directory) or not os.path.isdir(directory):
            return

        for file_name in os.listdir(directory):
            absolute_file_path = directory + '/' + file_name
            create_time_seconds = os.path.getctime(absolute_file_path)
            current_time_seconds = int(round(time.time()))
            if current_time_seconds - create_time_seconds > expired_seconds:
                os.remove(absolute_file_path) if os.path.exists(absolute_file_path) else None


@periodic_task(run_every=crontab(minute="*/30"))
def execute_csv_clear_task():
    print 'execute_csv_clear_task'
    CSVClearService.clear_expired_files()
