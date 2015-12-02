import os
import shutil
from unittest import TestCase

import time
from mock import patch

from eums.export_settings import EXPORTS_DIR
from eums.services.csv_clear_service import CSVClearService


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

    def __generate_file(self):
        os.mkdir(self.clear_directory) if not os.path.exists(self.clear_directory) else None
        absolute_path = self.clear_directory + '/' + self.clear_file_name
        export_file = open(absolute_path, 'wb')
        export_file.write('test content')
        return absolute_path

    def tearDown(self):
        shutil.rmtree(self.clear_directory) if os.path.exists(self.clear_directory) else None
