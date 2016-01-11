import json

from eums.models import Programme
from eums.settings import VISION_URL, VISION_BUSINESS_AREA_CODE
from eums.vision.vision_data_synchronizer import VisionDataSynchronizer


class ProgrammeSynchronizer(VisionDataSynchronizer):
    PROGRAMME_URL = VISION_URL + 'GetProgrammeStructureList_JSON/'
    REQUIRED_KEYS = ('OUTCOME_DESCRIPTION', 'OUTCOME_WBS')

    def __init__(self):
        super(ProgrammeSynchronizer, self).__init__(ProgrammeSynchronizer.PROGRAMME_URL + VISION_BUSINESS_AREA_CODE)

    def _get_json(self, data):
        return [] if data == self.NO_DATA_MESSAGE else data

    def _convert_records(self, records):
        return json.loads(records.get('GetProgrammeStructureList_JSONResult', []))

    def _save_records(self, records):
        filtered_records = self._filter_records(records)
        for record in filtered_records:
            programme, _ = Programme.objects.get_or_create(wbs_element_ex=record['OUTCOME_WBS'])
            programme.name = record['OUTCOME_DESCRIPTION']
            programme.save()

    @staticmethod
    def _filter_records(records):
        def is_valid_record(record):
            for key in ProgrammeSynchronizer.REQUIRED_KEYS:
                if not record[key]:
                    return False
            return True

        return filter(is_valid_record, records)
