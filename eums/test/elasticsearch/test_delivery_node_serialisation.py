from datetime import date

from django.test import TestCase

from eums.elasticsearch.serialisers import serialise_nodes
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory


class TestDeliveryNodeSerialisation(TestCase):
    def test_should_add_elasticsearch_meta_data_for_every_node(self):
        node = DeliveryNodeFactory()
        expected_es_meta_data = {'index': {'_index': 'eums', '_type': 'delivery_node', '_id': node.id}}

        serialised = serialise_nodes([node])

        self.assertDictEqual(expected_es_meta_data, serialised[0])

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

        self.assertDictContainsSubset(expected_node_serialisation, serialised[1])

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

        self.assertDictContainsSubset(expected_consignee_serialisation, serialised[1]['consignee'])

    def test_should_serialise_node_with_built_out_implementing_partner(self):
        ip = ConsigneeFactory()
        node = DeliveryNodeFactory(consignee=ip)

        expected_consignee_serialisation = {
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

        self.assertDictContainsSubset(expected_consignee_serialisation, serialised[1]['ip'])
