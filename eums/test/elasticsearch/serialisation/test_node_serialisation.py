import json
from django.conf import settings
from eums.elasticsearch.serialisers import serialise_nodes, convert_to_bulk_api_format, _serialise_datetime
from eums.test.elasticsearch.serialisation.serialisation_test_case import SerialisationTestCase
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.delivery_factory import DeliveryFactory
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory
from eums.test.factories.programme_factory import ProgrammeFactory

ES_SETTINGS = settings.ELASTIC_SEARCH


class TestDeliveryNodeSerialisation(SerialisationTestCase):
    def test_should_serialise_node_flat_fields(self):
        node = DeliveryNodeFactory()
        expected_node_serialisation = {
            "total_value": node.total_value,
            "track": node.track,
            "ip_id": node.ip.id,
            "tree_position": node.tree_position,
            "contact_person_id": node.contact_person_id,
            "item_id": node.item.id,
            "id": node.id,
            "remark": node.remark,
            "consignee_id": node.consignee.id,
            "acknowledged": node.acknowledged,
            "programme_id": node.programme.id,
            "location": node.location,
            "balance": node.balance,
            "distribution_plan_id": node.distribution_plan.id,
            "delivery_date": node.delivery_date
        }

        serialised = serialise_nodes([node])
        self.assertDictContainsSubset(expected_node_serialisation, serialised[0])

    def test_should_serialise_node_with_built_out_consignee(self):
        consignee = ConsigneeFactory()
        node = DeliveryNodeFactory(consignee=consignee)

        expected_consignee_serialisation = {
            "created_by_user_id": consignee.created_by_user.id,
            "name": consignee.name,
            "imported_from_vision": consignee.imported_from_vision,
            "location": consignee.location,
            "remarks": consignee.remarks,
            "customer_id": consignee.customer_id,
            "type": consignee.type,
            "id": consignee.id
        }

        serialised = serialise_nodes([node])
        self.assertDictContainsSubset(expected_consignee_serialisation, serialised[0]["consignee"])

    def test_should_serialise_node_with_built_out_implementing_partner(self):
        ip = ConsigneeFactory()
        node = DeliveryNodeFactory(consignee=ip)

        expected_ip_serialisation = {
            "created_by_user_id": ip.created_by_user.id,
            "name": ip.name,
            "imported_from_vision": ip.imported_from_vision,
            "location": ip.location,
            "remarks": ip.remarks,
            "customer_id": ip.customer_id,
            "type": ip.type,
            "id": ip.id
        }

        serialised = serialise_nodes([node])
        self.assertDictContainsSubset(expected_ip_serialisation, serialised[0]["ip"])

    def test_should_serialise_node_with_built_out_programme(self):
        programme = ProgrammeFactory()
        delivery = DeliveryFactory(programme=programme)
        node = DeliveryNodeFactory(distribution_plan=delivery)

        expected_programme_serialisation = {
            "wbs_element_ex": programme.wbs_element_ex,
            "id": programme.id,
            "name": programme.name
        }

        serialised = serialise_nodes([node])
        self.assertDictContainsSubset(expected_programme_serialisation, serialised[0]["programme"])

    def test_should_convert_nodes_to_bulk_api_format(self):
        node = DeliveryNodeFactory()
        expected_meta_data = '{"index": {"_index": \"%s\", "_type": \"%s\", "_id": %d}}\n' % (
            ES_SETTINGS.INDEX, ES_SETTINGS.NODE_TYPE, node.id
        )
        serialised = serialise_nodes([node])
        expected_node_string = json.dumps(serialised[0], default=_serialise_datetime) + '\n'

        api_format = convert_to_bulk_api_format(serialised)

        self.assertEqual(api_format, expected_meta_data + expected_node_string)
