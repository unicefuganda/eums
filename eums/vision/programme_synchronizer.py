import json

from eums.models import Programme
from eums.settings import VISION_URL, VISION_BUSINESS_AREA_CODE
from eums.vision.vision_data_synchronizer import VisionDataSynchronizer


class ProgrammeSynchronizer(VisionDataSynchronizer):
    PROGRAMME_URL = VISION_URL + 'GetProgrammeStructureList_JSON/'
    MAPPING_TEMPLATE = {'OUTCOME_DESCRIPTION': 'name',
                        'OUTCOME_WBS': 'wbs_element_ex'}

    def __init__(self):
        super(ProgrammeSynchronizer, self).__init__(self.PROGRAMME_URL + str(VISION_BUSINESS_AREA_CODE))

    def _get_json(self, data):
        return [] if data == self.NO_DATA_MESSAGE else data

    def _convert_records(self, records):
        programmes = json.loads(records.get('GetProgrammeStructureList_JSONResult', []))

        results = []
        for programme in programmes:
            filtered_programme = self.filter_relevant_value(self.MAPPING_TEMPLATE, programme)
            results.append(filtered_programme)

        return results

    def _save_records(self, records):
        for record in records:
            programme, _ = Programme.objects.get_or_create(wbs_element_ex=record['wbs_element_ex'])
            programme.name = record['name']
            programme.save()
