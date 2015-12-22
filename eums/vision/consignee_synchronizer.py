import json

from eums.models import Consignee
from eums.settings import VISION_URL, VISION_COUNTRY_CODE
from eums.vision.vision_data_synchronizer import VisionDataSynchronizer


class ConsigneeSynchronizer(VisionDataSynchronizer):
    CONSIGNEE_URL = VISION_URL + 'GetConsigneeList_JSON/'
    MAPPING_TEMPLATE = {'CONSIGNEE_NAME': 'name',
                        'CONSIGNEE_CODE': 'customer_id'}

    def __init__(self):
        super(ConsigneeSynchronizer, self).__init__(self.CONSIGNEE_URL + str(VISION_COUNTRY_CODE))

    def _get_json(self, data):
        return [] if data == self.NO_DATA_MESSAGE else data

    def _convert_records(self, records):
        consignees = json.loads(records)

        results = []
        for consignee in consignees:
            filtered_consignee = self.filter_relevant_value(self.MAPPING_TEMPLATE, consignee)
            results.append(filtered_consignee)

        return results

    def _save_records(self, records):
        for record in records:
            consignee, _ = Consignee.objects.get_or_create(customer_id=record['customer_id'])
            consignee.name = record['name']
            consignee.imported_from_vision = True
            consignee.save()
