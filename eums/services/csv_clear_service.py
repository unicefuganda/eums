import os
import time

from celery.schedules import crontab
from celery.task import periodic_task

from eums.celery import app
from eums.export_settings import *


class CSVClearService(object):
    @classmethod
    def config_clear_dir_expired_time_map(cls):
        csv_clear_dirs_expired_time_map = {
            CSVClearService.__absolute_category_path('report/feedback/'): 1 * 60
        }
        return csv_clear_dirs_expired_time_map

    @classmethod
    def __absolute_category_path(cls, category):
        return join(EXPORTS_DIR, category)


@periodic_task(run_every=crontab(minute="*/60"))
def clear_expired_csv():
    clear_dirs_expired_time_map = CSVClearService.config_clear_dir_expired_time_map()
    for directory in clear_dirs_expired_time_map.keys():
        __clear_files_by_directory(directory, clear_dirs_expired_time_map.get(directory))


def __clear_files_by_directory(directory, expired_seconds=DEFAULT_EXPIRED_SECONDS):
    if not os.path.exists(directory) or not os.path.isdir(directory):
        return

    for file_name in os.listdir(directory):
        abstract_file_path = directory + file_name
        create_time_seconds = os.path.getctime(abstract_file_path)
        current_time_seconds = int(round(time.time()))
        if current_time_seconds - create_time_seconds > expired_seconds:
            os.remove(abstract_file_path) if os.path.exists(abstract_file_path) else None
