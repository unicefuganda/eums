import json

from eums.models import Consignee
from eums.settings import VISION_URL, VISION_COUNTRY_CODE
from eums.vision.vision_data_synchronizer import VisionDataSynchronizer


class ConsigneeSynchronizer(VisionDataSynchronizer):
    CONSIGNEE_URL = VISION_URL + 'GetConsigneeList_JSON/'
    REQUIRED_KEYS = ('CONSIGNEE_NAME', 'CONSIGNEE_CODE')

    def __init__(self):
        super(ConsigneeSynchronizer, self).__init__(self.CONSIGNEE_URL + str(VISION_COUNTRY_CODE))

    def _get_json(self, data):
        return [] if data == self.NO_DATA_MESSAGE else data

    def _convert_records(self, records):
        return json.loads(records)

    def _save_records(self, records):
        filtered_records = self._filter_records(records)
        for record in filtered_records:
            consignee, _ = Consignee.objects.get_or_create(customer_id=record['CONSIGNEE_CODE'])
            consignee.name = record['CONSIGNEE_NAME']
            consignee.imported_from_vision = True
            consignee.save()

    @staticmethod
    def _filter_records(records):
        def is_valid_record(record):
            for key in ConsigneeSynchronizer.REQUIRED_KEYS:
                if not record[key]:
                    return False
            return True

        return filter(is_valid_record, records)
