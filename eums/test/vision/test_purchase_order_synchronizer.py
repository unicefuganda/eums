import datetime
from decimal import Decimal
from unittest import TestCase

from eums.models import Programme, SalesOrder, PurchaseOrder, PurchaseOrderItem, Item
from eums.vision.purchase_order_synchronizer import PurchaseOrderSynchronizer


class TestPurchaseOrderSynchronizer(TestCase):
    def setUp(self):
        self.synchronizer = PurchaseOrderSynchronizer(start_date='01012015')
        self._prepare_purchase_order_and_item()

    def tearDown(self):
        Item.objects.all().delete()
        Programme.objects.all().delete()
        SalesOrder.objects.all().delete()
        PurchaseOrder.objects.all().delete()
        PurchaseOrderItem.objects.all().delete()

    def test_should_get_existing_purchase_order(self):
        purchase_order = {'po_date': '/Date(1448859600000)/',
                          'so_number': 20173918,
                          'order_number': 45143984,
                          'po_type': 'NB',
                          'items': [{'po_item_number': 10,
                                     'material_description': 'Scale,electronic,mother/child,150kgx100g',
                                     'value': 51322.65,
                                     'material_code': 'S0141021',
                                     'so_item_number': 80,
                                     'quantity': 100}]}

        self.synchronizer._get_or_create_new_order(purchase_order)

        self.assertEqual(PurchaseOrder.objects.count(), 1)
        self.assertEqual(PurchaseOrder.objects.all().first().order_number, 45143984)

    def test_should_create_purchase_order(self):
        purchase_order = {'po_date': '/Date(1450069200000)/',
                          'so_number': 20174363,
                          'order_number': 45144863,
                          'po_type': 'ZLC',
                          'items': [{'po_item_number': 20,
                                     'material_description': 'Laundry soap, Carton, 25 bars, 800 grams',
                                     'value': 2673,
                                     'material_code': 'SL009100',
                                     'so_item_number': 10,
                                     'quantity': 80}]}

        self.synchronizer._get_or_create_new_order(purchase_order)

        self.assertEqual(PurchaseOrder.objects.count(), 2)
        self.assertEqual(PurchaseOrder.objects.all().last().order_number, 45144863)

    def test_should_update_purchase_order_item(self):
        purchase_order_item = {'po_item_number': 10,
                               'material_description': 'Scale,electronic,mother/child,150kgx100g',
                               'value': 9999.99,
                               'material_code': 'S0141021',
                               'so_item_number': 80,
                               'quantity': 100}

        self.assertEqual(PurchaseOrderItem.objects.count(), 1)
        self.synchronizer._update_or_create_new_item(purchase_order_item, self.purchase_order_1)
        self.assertEqual(PurchaseOrderItem.objects.count(), 1)
        self.assertEqual(PurchaseOrderItem.objects.all().first().value, Decimal('9999.99'))

    def test_should_create_purchase_order_item(self):
        purchase_order_item = {'po_item_number': 20,
                               'material_description': 'Laundry soap, Carton, 25 bars, 800 grams',
                               'value': 2673,
                               'material_code': 'SL009100',
                               'so_item_number': 10,
                               'quantity': 80}

        self.assertEqual(PurchaseOrderItem.objects.count(), 1)
        self.synchronizer._update_or_create_new_item(purchase_order_item, self.purchase_order_1)
        self.assertEqual(PurchaseOrderItem.objects.count(), 2)
        self.assertEqual(PurchaseOrderItem.objects.all().last().quantity, 80)

    def _prepare_purchase_order_and_item(self):
        self.programme_1 = Programme(wbs_element_ex='0060/A0/07/883')
        self.programme_1.save()
        self.sales_order_1 = SalesOrder(programme=self.programme_1,
                                        order_number=20173918,
                                        date=datetime.date(2015, 12, 3))
        self.sales_order_1.save()
        self.purchase_order_1 = PurchaseOrder(order_number=45143984,
                                              sales_order=self.sales_order_1,
                                              date=datetime.date(2015, 11, 30),
                                              po_type='NB')
        self.purchase_order_1.save()
        self.programme_2 = Programme(wbs_element_ex='4380/A0/04/105')
        self.programme_2.save()
        self.sales_order_2 = SalesOrder(programme=self.programme_2,
                                        order_number=20174363,
                                        date=datetime.date(2015, 12, 14))
        self.sales_order_2.save()
        self.item_1 = Item(description='Scale,electronic,mother/child,150kgx100g',
                           material_code='S0141021')
        self.item_1.save()
        self.purchase_order_item_1 = PurchaseOrderItem(purchase_order=self.purchase_order_1,
                                                       item=self.item_1,
                                                       item_number=10,
                                                       sales_order_item=None,
                                                       quantity=100.00,
                                                       value=Decimal('51322.65'))
        self.purchase_order_item_1.save()
