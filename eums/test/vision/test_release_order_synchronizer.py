import datetime
from unittest import TestCase

from eums.models import Programme, SalesOrder, PurchaseOrder, ReleaseOrder, Consignee
from eums.vision.release_order_synchronizer import ReleaseOrderSynchronizer


class TestReleaseOrderSynchronizer(TestCase):
    def setUp(self):
        self.synchronizer = ReleaseOrderSynchronizer(start_date='01012015')
        self._prepare_purchase_order_and_item()

    def tearDown(self):
        Consignee.objects.all().delete()
        Programme.objects.all().delete()
        SalesOrder.objects.all().delete()
        PurchaseOrder.objects.all().delete()
        ReleaseOrder.objects.all().delete()

    def test_should_get_existing_release_order(self):
        release_order = {'items': [{'po_item_number': 10,
                                    'material_code': 'S0141021',
                                    'ro_item_number': 10,
                                    'value': 15030.86,
                                    'purchase_order': 45143984,
                                    'quantity': 55}],
                         'purchase_order': 45143984,
                         'shipment_end_date': '/Date(1448254800000)/',
                         'waybill': 72124798,
                         'consignee': 'L626010384',
                         'so_number': 20173918,
                         'order_number': 54155912,
                         'consignee_name': ''}

        self.assertEqual(ReleaseOrder.objects.count(), 1)
        self.synchronizer._get_or_create_new_order(release_order)
        self.assertEqual(ReleaseOrder.objects.count(), 1)
        self.assertEqual(ReleaseOrder.objects.all().first().waybill, 72124798)

    def test_should_create_release_order(self):
        release_order = {'items': [{'po_item_number': 10,
                                    'material_code': 'S0141021',
                                    'ro_item_number': 10,
                                    'value': 15030.86,
                                    'purchase_order': 45143984,
                                    'quantity': 55}],
                         'purchase_order': 45143984,
                         'shipment_end_date': '/Date(1448254800000)/',
                         'waybill': 72124798,
                         'consignee': 'L626010384',
                         'so_number': 20173918,
                         'order_number': 54150001,
                         'consignee_name': ''}
        self.assertEqual(ReleaseOrder.objects.count(), 1)
        self.synchronizer._get_or_create_new_order(release_order)
        self.assertEqual(ReleaseOrder.objects.count(), 2)
        self.assertEqual(ReleaseOrder.objects.all().last().order_number, 54150001)

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
        consignee_1 = Consignee(customer_id='L626010384')
        consignee_1.save()
        self.release_order_1 = ReleaseOrder(order_number=54155912,
                                            waybill=72124798,
                                            delivery_date=datetime.date(2015, 11, 23),
                                            consignee=consignee_1,
                                            sales_order=self.sales_order_1,
                                            purchase_order=self.purchase_order_1)
        self.release_order_1.save()
