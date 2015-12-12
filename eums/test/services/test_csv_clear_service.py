import os
import shutil
import time
from unittest import TestCase

from celery.schedules import crontab
from mock import patch

from eums.settings_export import EXPORTS_DIR
from eums.services.csv_clear_service import CSVClearService
from eums.test.services.mock_celery import MockPeriodicTask


class CSVClearServiceTest(TestCase):
    clear_directory = EXPORTS_DIR + 'test'
    clear_file_name = 'report.csv'

    @patch('eums.services.csv_clear_service.CSVClearService.config_clear_dir_expired_time_map')
    def test_clear_expired_csv_should_clear_expired_files(self, config_clear_dir_expired_time_map):
        expired_seconds = 5
        mock_data = {self.clear_directory: expired_seconds}
        config_clear_dir_expired_time_map.return_value = mock_data

        absolute_file_path = self.__generate_file()

        time.sleep(expired_seconds + 1)
        CSVClearService.clear_expired_files()

        self.assertFalse(os.path.exists(absolute_file_path))
        config_clear_dir_expired_time_map.assert_called_once_with()
        os.remove(absolute_file_path) if os.path.exists(absolute_file_path) else None

    @patch('eums.services.csv_clear_service.CSVClearService.config_clear_dir_expired_time_map')
    def test_clear_expired_csv_should_do_nothing_if_files_not_expired(self, config_clear_dir_expired_time_map):
        expired_seconds = 10
        mock_data = {self.clear_directory: expired_seconds}
        config_clear_dir_expired_time_map.return_value = mock_data

        absolute_file_path = self.__generate_file()

        CSVClearService.clear_expired_files()

        self.assertTrue(os.path.exists(absolute_file_path))
        config_clear_dir_expired_time_map.assert_called_once_with()
        os.remove(absolute_file_path) if os.path.exists(absolute_file_path) else None

    @patch('eums.services.csv_clear_service.execute_csv_clear_task')
    def test_execute_csv_clear_task_should_execute_every_30_inutes(self, mock_execute_csv_clear_task):
        mock_execute_csv_clear_task.return_value = None
        mock_execute_csv_clear_task()

        MockPeriodicTask.assert_called_with(crontab(minute="*/30"))

    def __generate_file(self):
        os.mkdir(self.clear_directory) if not os.path.exists(self.clear_directory) else None
        absolute_path = self.clear_directory + '/' + self.clear_file_name
        export_file = open(absolute_path, 'wb')
        export_file.write('test content')
        return absolute_path

    def tearDown(self):
        shutil.rmtree(self.clear_directory) if os.path.exists(self.clear_directory) else None
