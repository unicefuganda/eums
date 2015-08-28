from unittest import TestCase
from datetime import datetime
from django.db import IntegrityError
from mock import patch

from eums.models import DistributionPlanNode as DeliveryNode, SalesOrder, DistributionPlan, Arc, PurchaseOrderItem, \
    Item, Consignee, Alert, Runnable
from eums.test.factories.answer_factory import MultipleChoiceAnswerFactory
from eums.test.factories.arc_factory import ArcFactory
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.delivery_factory import DeliveryFactory
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory
from eums.test.factories.item_factory import ItemFactory
from eums.test.factories.option_factory import OptionFactory
from eums.test.factories.purchase_order_factory import PurchaseOrderFactory
from eums.test.factories.purchase_order_item_factory import PurchaseOrderItemFactory
from eums.test.factories.question_factory import MultipleChoiceQuestionFactory
from eums.test.factories.release_order_factory import ReleaseOrderFactory
from eums.test.factories.release_order_item_factory import ReleaseOrderItemFactory
from eums.test.factories.run_factory import RunFactory
from eums.test.factories.sales_order_item_factory import SalesOrderItemFactory


class DeliveryNodeTest(TestCase):
    def setUp(self):
        self.clean_up()

    def tearDown(self):
        self.clean_up()

    def test_should_create_itself_with_any_type_of_order_item(self):
        sales_order_item = SalesOrderItemFactory()
        purchase_order_item = PurchaseOrderItemFactory()
        release_order_item = ReleaseOrderItemFactory()

        node_with_so_item = DeliveryNodeFactory(item=sales_order_item)
        node_with_po_item = DeliveryNodeFactory(item=purchase_order_item)
        node_with_ro_item = DeliveryNodeFactory(item=release_order_item)

        self.assertEqual(DeliveryNode.objects.get(item=sales_order_item), node_with_so_item)
        self.assertEqual(DeliveryNode.objects.get(item=purchase_order_item), node_with_po_item)
        self.assertEqual(DeliveryNode.objects.get(item=release_order_item), node_with_ro_item)

    def test_should_create_itself_with_parent_as_list_of_parent_quantity_tuples(self):
        parent_one = DeliveryNodeFactory(quantity=100)
        parent_two = DeliveryNodeFactory(quantity=40)

        node = DeliveryNodeFactory(parents=[(parent_one, 50), (parent_two, 40)])

        self.assertEqual(node.quantity_in(), 90)
        self.assertEqual(parent_one.quantity_out(), 50)
        self.assertEqual(parent_two.quantity_out(), 40)

    def test_should_compute_quantity_in_from_incoming_arcs(self):
        node = DeliveryNodeFactory(quantity=0)
        ArcFactory(source=None, target=node, quantity=50)
        self.assertEqual(node.quantity_in(), 50)

        ArcFactory(source=None, target=node, quantity=50)
        self.assertEqual(node.quantity_in(), 100)

        Arc.objects.all().delete()
        self.assertEqual(node.quantity_in(), 0)

    def test_should_compute_quantity_out_from_outgoing_arcs(self):
        node_one = DeliveryNodeFactory(quantity=50)
        node_two = DeliveryNodeFactory()
        ArcFactory(source=node_one, target=node_two, quantity=50)
        self.assertEqual(node_one.quantity_out(), 50)
        self.assertEqual(node_two.quantity_out(), 0)

        Arc.objects.all().delete()
        self.assertEqual(node_one.quantity_out(), 0)

    def test_should_create_null_source_arc_for_node_if_parents_are_not_specified_but_quantity_is(self):
        root_node = DeliveryNodeFactory(quantity=70)
        arc = Arc.objects.filter(target=root_node).first()
        self.assertEqual(arc.quantity, 70)
        self.assertIsNone(arc.source)

    def test_should_allow_zero_quantity_nodes_to_be_saved(self):
        node = DeliveryNodeFactory(quantity=0)
        self.assertEqual(node.id, DeliveryNode.objects.get(pk=node.id).id)

    def test_should_not_create_node_when_parents_and_quantity_are_not_specified(self):
        create_node = lambda: DeliveryNodeFactory(quantity=None, parents=None)
        self.assertRaises(IntegrityError, create_node)

    def test_should_create_an_arc_for_each_parent_specified_when_creating_a_node(self):
        parent_one = DeliveryNodeFactory()
        parent_two = DeliveryNodeFactory()

        node = DeliveryNodeFactory(parents=[{'id': parent_one.id, 'quantity': 5}, {'id': parent_two.id, 'quantity': 8}])
        arc_quantities = [arc.quantity for arc in node.arcs_in.all()]
        arc_sources = [arc.source.id for arc in node.arcs_in.all()]

        self.assertEqual(node.arcs_in.count(), 2)
        self.assertIn(8, arc_quantities)
        self.assertIn(5, arc_quantities)
        self.assertIn(parent_one.id, arc_sources)
        self.assertIn(parent_two.id, arc_sources)

    def test_should_list_all_root_nodes_for_a_delivery(self):
        delivery = DeliveryFactory()
        root_node_one = DeliveryNodeFactory(distribution_plan=delivery)
        root_node_two = DeliveryNodeFactory(distribution_plan=delivery)
        child_node = DeliveryNodeFactory(distribution_plan=delivery, parents=[{'id': root_node_one.id, 'quantity': 5}])

        root_nodes = DeliveryNode.objects.root_nodes_for(delivery=delivery)
        self.assertEqual(root_nodes.count(), 2)

        root_node_ids = [node.id for node in root_nodes]
        self.assertIn(root_node_one.id, root_node_ids)
        self.assertIn(root_node_two.id, root_node_ids)
        self.assertNotIn(child_node.id, root_node_ids)

    def test_update_should_override_parents_when_parents_list_is_passed(self):
        node_one = DeliveryNodeFactory()
        node_two = DeliveryNodeFactory()

        node = DeliveryNodeFactory(parents=[{'id': node_one.id, 'quantity': 8}, {'id': node_two.id, 'quantity': 10}])
        self.assertEqual(node.quantity_in(), 18)

        node.parents = [{'id': node_one.id, 'quantity': 7}]
        node.save()
        self.assertEqual(node.quantity_in(), 7)

        node.parents = []
        node.save()
        self.assertEqual(node.quantity_in(), 0)

    def test_update_should_leave_parents_intact_if_parents_are_not_specified(self):
        node_one = DeliveryNodeFactory()
        node_two = DeliveryNodeFactory()

        node = DeliveryNodeFactory(parents=[{'id': node_one.id, 'quantity': 8}, {'id': node_two.id, 'quantity': 10}])

        node.location = 'Changed'
        node.save()
        self.assertEqual(node.quantity_in(), 18)
        self.assertEqual(node.location, 'Changed')

    def test_update_quantity_on_root_node_should_update_quantity(self):
        node = DeliveryNodeFactory(quantity=100)
        node.quantity = 50
        node.save()
        self.assertEqual(node.quantity_in(), 50)

    def test_update_quantity_to__zero_on_root_node(self):
        node = DeliveryNodeFactory(quantity=100)
        node.quantity = 0
        node.save()
        self.assertEqual(node.quantity_in(), 0)

    def test_should_ignore_updates_to_quantity_on_non_root_node(self):
        node_one = DeliveryNodeFactory()
        node = DeliveryNodeFactory(parents=[{'id': node_one.id, 'quantity': 7}])

        node.quantity = 50
        node.save()

        self.assertEqual(node.quantity_in(), 7)

    def test_should_ignore_quantity_on_update_if_parents_are_specified(self):
        node_one = DeliveryNodeFactory()

        node = DeliveryNodeFactory(quantity=0)

        node.parents = [{'id': node_one.id, 'quantity': 7}]
        node.quantity = 50
        node.save()
        self.assertEqual(node.quantity_in(), 7)

        node.parents = []
        node.save()
        self.assertEqual(node.quantity_in(), 0)

    def test_should_get_a_nodes_ip_from_the_root_node_of_the_node_delivery(self):
        delivery = DeliveryFactory()

        root_node = DeliveryNodeFactory(distribution_plan=delivery)
        self.assertEqual(root_node.get_ip(), {'id': root_node.id, 'location': root_node.location})

        intermediary_node = DeliveryNodeFactory(distribution_plan=delivery, parents=[(root_node, 5)])
        self.assertEqual(intermediary_node.get_ip(), {'id': root_node.id, 'location': root_node.location})

        leaf_node = DeliveryNodeFactory(parents=[(intermediary_node, 3)], distribution_plan=delivery)
        self.assertEqual(leaf_node.get_ip(), {'id': root_node.id, 'location': root_node.location})

    def test_should_get_sender_name(self):
        sender_name = 'Save the children'
        root_node = DeliveryNodeFactory(consignee=ConsigneeFactory(name=sender_name))
        self.assertEqual(root_node.sender_name(), 'UNICEF')

        node = DeliveryNodeFactory(parents=[(root_node, 5)])
        self.assertEqual(node.sender_name(), sender_name)

    def test_should_return_list_of_children(self):
        parent_node = DeliveryNodeFactory(quantity=100)
        child_one = DeliveryNodeFactory(parents=[(parent_node, 30)])
        child_two = DeliveryNodeFactory(parents=[(parent_node, 20)])

        children = parent_node.children()
        self.assertEqual(children.count(), 2)
        self.assertIn(child_one, children)
        self.assertIn(child_two, children)

    def test_should_get_root_nodes_for_an_order_item_list(self):
        purchase_order_item_one = PurchaseOrderItemFactory()
        purchase_order_item_two = PurchaseOrderItemFactory()
        root_node_one = DeliveryNodeFactory(item=purchase_order_item_one)
        root_node_two = DeliveryNodeFactory(item=purchase_order_item_two)
        DeliveryNodeFactory(item=purchase_order_item_one, parents=[(root_node_one, 5)])

        item_list = PurchaseOrderItem.objects.filter(pk__in=[purchase_order_item_one.pk, purchase_order_item_two.pk])

        root_nodes = DeliveryNode.objects.root_nodes_for(order_items=item_list)

        self.assertEqual(root_nodes.count(), 2)
        self.assertIn(root_node_one, root_nodes)
        self.assertIn(root_node_two, root_nodes)

    def test_should_not_save_tracked_nodes_with_quantity_delivered_equal_to_zero(self):
        self.assertEqual(DeliveryNode.objects.count(), 0)
        node = DeliveryNodeFactory(quantity=0, track=True)
        self.assertEqual(DeliveryNode.objects.count(), 0)
        self.assertTrue(isinstance(node, DeliveryNode))

    def test_should_delete_zero_quantity_nodes_on_update_with_track_true(self):
        node = DeliveryNodeFactory(quantity=0, track=False)
        self.assertEqual(DeliveryNode.objects.count(), 1)

        node.track = True
        returned_node = node.save()
        self.assertEqual(DeliveryNode.objects.count(), 0)
        self.assertTrue(isinstance(returned_node, DeliveryNode))

    def test_should_delete_tracked_node_on_update_with_zero_quantity(self):
        node = DeliveryNodeFactory(quantity=10, track=True)
        self.assertEqual(DeliveryNode.objects.count(), 1)

        node.quantity = 0
        returned_node = node.save()
        self.assertEqual(DeliveryNode.objects.count(), 0)
        self.assertTrue(isinstance(returned_node, DeliveryNode))

    def test_should_get_all_nodes_delivered_by_a_consignee_for_a_specific_item(self):
        item = ItemFactory()
        consignee = ConsigneeFactory()

        node_one = DeliveryNodeFactory(item=PurchaseOrderItemFactory(item=item), consignee=consignee)
        child_node_one = DeliveryNodeFactory(item=PurchaseOrderItemFactory(item=item), parents=[(node_one, 10)])

        node_two = DeliveryNodeFactory(item=PurchaseOrderItemFactory(item=item), consignee=consignee)
        child_node_two = DeliveryNodeFactory(item=PurchaseOrderItemFactory(item=item), parents=[(node_two, 10)])

        other_item_node_to_consignee = DeliveryNodeFactory(consignee=consignee, quantity=200)
        non_item_child_node = DeliveryNodeFactory(parents=[(other_item_node_to_consignee, 100)])

        non_consignee_child_node = DeliveryNodeFactory(item=PurchaseOrderItemFactory(item=item))

        returned_nodes = DeliveryNode.objects.delivered_by_consignee(consignee, item)

        self.assertItemsEqual([child_node_one, child_node_two], returned_nodes)
        self.assertNotIn(non_consignee_child_node, returned_nodes)
        self.assertNotIn(non_item_child_node, returned_nodes)

    def test_should_confirm_delivery_from_node_when_all_nodes_in_delivery_are_answered(self):
        delivery = DeliveryFactory()
        node_one = DeliveryNodeFactory(distribution_plan=delivery)
        node_two = DeliveryNodeFactory(distribution_plan=delivery)

        item_question = MultipleChoiceQuestionFactory(label='itemReceived')
        option_one = OptionFactory(text='Yes', question=item_question)
        option_two = OptionFactory(text='No', question=item_question)

        node_one.confirm()
        self.assertFalse(delivery.confirmed)

        MultipleChoiceAnswerFactory(run=RunFactory(runnable=node_one), question=item_question, value=option_one)
        node_one.confirm()
        self.assertFalse(delivery.confirmed)

        MultipleChoiceAnswerFactory(run=RunFactory(runnable=node_two), question=item_question, value=option_two)
        node_one.confirm()
        self.assertTrue(delivery.confirmed)

    def clean_up(self):
        DistributionPlan.objects.all().delete()
        SalesOrder.objects.all().delete()
        Item.objects.all().delete()
        Consignee.objects.all().delete()

    def test_should_return_node_with_order_number(self):
        po = PurchaseOrderFactory(order_number=123456)
        po_item = PurchaseOrderItemFactory(purchase_order=po)
        node = DeliveryNodeFactory(item=po_item)

        self.assertEqual(node.number(), 123456)

    def test_should_return_delivery_with_waybill_number(self):
        release_order = ReleaseOrderFactory(waybill=98765)
        release_order_item = ReleaseOrderItemFactory(release_order=release_order)
        node = DeliveryNodeFactory(item=release_order_item)

        self.assertEqual(node.number(), 98765)

    def test_should_return_delivery_type_purchase_order(self):
        po_item = PurchaseOrderItemFactory()
        node = DeliveryNodeFactory(item=po_item)

        self.assertEqual(node.type(), 'Purchase Order')

    def test_should_return_delivery_type_waybill(self):
        ro_item = ReleaseOrderItemFactory()
        node = DeliveryNodeFactory(item=ro_item)

        self.assertEqual(node.type(), 'Waybill')

    def test_should_set_balance_on_node_when_saved(self):
        node = DeliveryNodeFactory(quantity=100)
        self.assertEqual(node.balance, 100)

    def test_should_update_balance_when_node_quantities_change(self):
        node = DeliveryNodeFactory(quantity=100)
        child = DeliveryNodeFactory(parents=[(node, 50)])

        self.assertEqual(child.balance, 50)
        self.assertEqual(DeliveryNode.objects.get(id=node.id).balance, 50)

        child_two = DeliveryNodeFactory(parents=[(node, 40)])
        self.assertEqual(child_two.balance, 40)
        self.assertEqual(DeliveryNode.objects.get(id=node.id).balance, 10)

        child_two.delete()
        self.assertEqual(DeliveryNode.objects.get(id=node.id).balance, 50)

    def test_should_know_its_order_number(self):
        purchase_order = PurchaseOrderFactory(order_number=200)
        po_node = DeliveryNodeFactory(item=PurchaseOrderItemFactory(purchase_order=purchase_order))
        self.assertEqual(po_node.order_number(), 200)

        release_order = ReleaseOrderFactory(waybill=300)
        ro_node = DeliveryNodeFactory(item=ReleaseOrderItemFactory(release_order=release_order))
        self.assertEqual(ro_node.order_number(), 300)

    def test_delivery_node_knows_its_item_description(self):
        purchase_order = PurchaseOrderFactory(order_number=200)
        description = "some description"
        item = ItemFactory(description=description)
        po_node = DeliveryNodeFactory(item=PurchaseOrderItemFactory(purchase_order=purchase_order, item=item))

        self.assertEqual(po_node.item_description(), description)

    @patch('eums.models.runnable.Runnable.build_contact')
    def test_should_create_alert_with_item_description(self, mock_contact):
        purchase_order = PurchaseOrderFactory(order_number=5678)
        description = "some description"
        item = ItemFactory(description=description)
        purchase_order_item = PurchaseOrderItemFactory(purchase_order=purchase_order, item=item)
        consignee = ConsigneeFactory(name="Liverpool FC")

        contact_person_id = 'some_id'
        contact = {u'_id': contact_person_id,
                   u'firstName': u'Chris',
                   u'lastName': u'George',
                   u'phone': u'+256781111111'}
        mock_contact.return_value = contact

        node = DeliveryNodeFactory(item=purchase_order_item, consignee=consignee, contact_person_id=contact_person_id)

        node.create_alert(Alert.ISSUE_TYPES.not_received)

        self.assertTrue(mock_contact.called)

        alerts = Alert.objects.filter(consignee_name="Liverpool FC", order_number=5678)
        self.assertEqual(alerts.count(), 1)
        alert = alerts.first()
        self.assertEqual(alert.order_type, PurchaseOrderItem.PURCHASE_ORDER)
        self.assertEqual(alert.order_number, 5678)
        self.assertEqual(alert.consignee_name, "Liverpool FC")
        self.assertEqual(alert.contact_name, "Chris George")
        self.assertEqual(alert.issue, Alert.ISSUE_TYPES.not_received)
        self.assertFalse(alert.is_resolved)
        self.assertIsNone(alert.remarks)
        self.assertEqual(alert.runnable, node)
        self.assertEqual(alert.item_description, description)

    def test_should_save_node_when_quantity_is_not_specified_but_parents_are(self):
        parent = DeliveryNodeFactory(consignee=ConsigneeFactory())
        node = DeliveryNode.objects.create(parents=[(parent, 5)],
                                           consignee=ConsigneeFactory(),
                                           item=PurchaseOrderItemFactory(),
                                           tree_position=Runnable.MIDDLE_MAN,
                                           location='Jinja',
                                           contact_person_id='89878528-864A-4320-8426-1DB5C9A5A337',
                                           delivery_date=datetime.today())
        self.assertEqual(DeliveryNode.objects.get(pk=node.id), node)

    def test_should_get_node_tracked_status_from_its_parents_if_they_are_provided(self):
        parent_one = DeliveryNodeFactory(track=True)
        parent_two = DeliveryNodeFactory(track=False)

        node_with_tuple_parents = DeliveryNodeFactory(parents=[(parent_one, 5), (parent_two, 4)], track=False)
        node_with_dict_parents = DeliveryNodeFactory(parents=[{'id': parent_one.id, 'quantity': 5}], track=False)
        untracked_node = DeliveryNodeFactory(parents=[(parent_two, 5)], track=True)

        self.assertTrue(node_with_tuple_parents.track)
        self.assertTrue(node_with_dict_parents.track)
        self.assertFalse(untracked_node.track)
