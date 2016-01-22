import datetime
from decimal import Decimal
from unittest import TestCase

from mock import MagicMock

from eums.models import Programme, SalesOrder, PurchaseOrderItem, PurchaseOrder, Item, OrderItem, \
    ReleaseOrder, ReleaseOrderItem, Consignee
from eums.vision.release_order_synchronizer import ReleaseOrderSynchronizer


class TestSyncReleaseOrder(TestCase):
    def setUp(self):
        self.downloaded_release_orders = [{"RELEASE_ORDER_NUMBER": u"0054155912",
                                           "RELEASE_ORDER_ITEM": 10,
                                           "RELEASE_ORDER_TYPE": "ZLO",
                                           "SALES_UNIT": "EA",
                                           "PLANT": "5631",
                                           "SHIP_TO_PARTY": "L626010384",
                                           "WAREHOUSE_NUMBER": "492",
                                           "CONSIGNEE": "L626010384",
                                           "DOCUMENT_DATE": u"/Date(1447390800000)/",
                                           "GOODS_ISSUE_DATE": u"/Date(1448254800000)/",
                                           "MATERIAL_NUMBER": "S0141021",
                                           "DELIVERY_QUANTITY": 55,
                                           "VALUE": 15030.86,
                                           "MOVING_AVG_PRICE": 273.29,
                                           "SO_NUMBER": u"0020173918",
                                           "PO_NUMBER": u"0045143984",
                                           "PO_ITEM": 10,
                                           "WBS_ELEMENT": "6260\/A0\/05\/401\/005\/001",
                                           "WAYBILL_NUMBER": u"0072124798",
                                           "FORWARDER_NO": None,
                                           "SHIPMENT_END_DATE": u"/Date(1448254800000)/",
                                           "ACTUAL_SHIPMENT_START_DATE": None,
                                           "SHIPMENT_COMPLETION_DATE": None,
                                           "RELEASE_ORDER_CREATE_DATE": u"/Date(1447390800000)/",
                                           "RELEASE_ORDER_UPDATE_DATE": u"/Date(1447390800000)/"}]
        self.converted_release_orders = [{"RELEASE_ORDER_NUMBER": 54155912,
                                          "RELEASE_ORDER_ITEM": 10,
                                          "RELEASE_ORDER_TYPE": "ZLO",
                                          "SALES_UNIT": "EA",
                                          "PLANT": "5631",
                                          "SHIP_TO_PARTY": "L626010384",
                                          "WAREHOUSE_NUMBER": "492",
                                          "CONSIGNEE": "L626010384",
                                          "DOCUMENT_DATE": datetime.datetime(2015, 11, 13, 8, 0),
                                          "GOODS_ISSUE_DATE": datetime.datetime(2015, 11, 23, 8, 0),
                                          "MATERIAL_NUMBER": "S0141021",
                                          "DELIVERY_QUANTITY": 55,
                                          "VALUE": 15030.86,
                                          "MOVING_AVG_PRICE": 273.29,
                                          "SO_NUMBER": 20173918,
                                          "PO_NUMBER": 45143984,
                                          "PO_ITEM": 10,
                                          "WBS_ELEMENT": "6260\/A0\/05\/401\/005\/001",
                                          "WAYBILL_NUMBER": 72124798,
                                          "FORWARDER_NO": None,
                                          "SHIPMENT_END_DATE": datetime.datetime(2015, 11, 23, 8, 0),
                                          "ACTUAL_SHIPMENT_START_DATE": None,
                                          "SHIPMENT_COMPLETION_DATE": None,
                                          "RELEASE_ORDER_CREATE_DATE": datetime.datetime(2015, 11, 13, 8, 0),
                                          "RELEASE_ORDER_UPDATE_DATE": datetime.datetime(2015, 11, 13, 8, 0)}]
        self._prepare_sales_and_purchase_order()
        consignee_1 = Consignee(customer_id='L626010384')
        self.expected_release_order_1 = ReleaseOrder(order_number=54155912,
                                                     waybill=72124798,
                                                     delivery_date=datetime.date(2015, 11, 23),
                                                     consignee=consignee_1,
                                                     sales_order=self.sales_order_1,
                                                     purchase_order=self.purchase_order_1)
        item = Item(material_code='S0141021')
        self.expected_release_order_item_1 = ReleaseOrderItem(release_order=self.expected_release_order_1,
                                                              purchase_order_item=self.purchase_order_item_1,
                                                              item=item,
                                                              item_number=10,
                                                              quantity=55,
                                                              value=Decimal('15030.86'))
        self.release_order_which_can_not_refer_to_sales_order \
            = [{'PO_ITEM': 10,
                'MATERIAL_NUMBER': 'S0141021',
                'RELEASE_ORDER_ITEM': 10,
                'VALUE': 15030.86,
                'DELIVERY_QUANTITY': 55,
                'PO_NUMBER': 45143984,
                'SHIPMENT_END_DATE': '/Date(1448254800000)/',
                'WAYBILL_NUMBER': 72124798,
                'CONSIGNEE': 'L626010384',
                'SO_NUMBER': 20170001,
                'RELEASE_ORDER_NUMBER': 54155912,
                'RELEASE_ORDER_UPDATE_DATE': datetime.datetime(2015, 11, 13, 8, 0)}]
        self.release_order_which_can_not_refer_to_purchase_order \
            = [{'PO_ITEM': 10,
                'MATERIAL_NUMBER': 'S0141021',
                'RELEASE_ORDER_ITEM': 10,
                'VALUE': 15030.86,
                'DELIVERY_QUANTITY': 55,
                'PO_NUMBER': 45140001,
                'SHIPMENT_END_DATE': '/Date(1448254800000)/',
                'WAYBILL_NUMBER': 72124798,
                'CONSIGNEE': 'L626010384',
                'SO_NUMBER': 20173918,
                'RELEASE_ORDER_NUMBER': 54155912,
                'RELEASE_ORDER_UPDATE_DATE': datetime.datetime(2015, 11, 13, 8, 0)}]

        start_date = '01122015'
        end_date = datetime.date.today().strftime('%d%m%Y')
        self.synchronizer = ReleaseOrderSynchronizer(start_date=start_date)
        base_url = 'https://devapis.unicef.org/BIService/BIWebService.svc/GetReleaseOrderInfo_JSON/'
        self.expected_url = base_url + start_date + '/' + end_date

    def tearDown(self):
        Consignee.objects.all().delete()
        SalesOrder.objects.all().delete()
        Item.objects.all().delete()
        OrderItem.objects.all().delete()
        Programme.objects.all().delete()
        PurchaseOrder.objects.all().delete()
        PurchaseOrderItem.objects.all().delete()
        ReleaseOrder.objects.all().delete()
        ReleaseOrderItem.objects.all().delete()

    def test_should_point_to_correct_endpoint(self):
        self.synchronizer._load_records = MagicMock(return_value=[])
        self.synchronizer.sync()

        self.assertEqual(self.synchronizer.url, self.expected_url)

    def test_should_load_release_orders(self):
        self.synchronizer._load_records = MagicMock(return_value=self.downloaded_release_orders)
        self.synchronizer._convert_records = MagicMock()
        self.synchronizer._save_records = MagicMock()
        self.synchronizer.sync()

        self.synchronizer._load_records.assert_called()
        self.synchronizer._convert_records.assert_called()
        self.synchronizer._save_records.assert_called()

    def test_should_convert_release_orders(self):
        self.synchronizer._load_records = MagicMock(return_value=self.downloaded_release_orders)
        self.synchronizer._save_records = MagicMock()
        self.synchronizer.sync()

        self.synchronizer._save_records.assert_called_with(self.converted_release_orders)

    def test_should_save_release_orders(self):
        self.synchronizer._load_records = MagicMock(return_value=self.downloaded_release_orders)
        self.synchronizer.sync()

        all_release_orders = ReleaseOrder.objects.all()
        actual_release_order_1 = all_release_orders[0]

        self._assert_release_order_equal(actual_release_order_1, self.expected_release_order_1)

    def test_should_save_release_order_items(self):
        self.synchronizer._load_records = MagicMock(return_value=self.downloaded_release_orders)
        self.synchronizer.sync()

        all_release_order_items = ReleaseOrderItem.objects.all()
        actual_release_order_item_1 = all_release_order_items[0]

        self._assert_release_order_item_equal(actual_release_order_item_1, self.expected_release_order_item_1)

    def test_should_NOT_save_release_order_which_can_not_refer_to_existing_sales_order(self):
        self.synchronizer._load_records = MagicMock(return_value=self.release_order_which_can_not_refer_to_sales_order)
        self.synchronizer.sync()

        self.assertEqual(ReleaseOrder.objects.count(), 0)

    def test_should_NOT_save_release_order_which_can_not_refer_to_exsiting_purchase_order(self):
        self.synchronizer._load_records = \
            MagicMock(return_value=self.release_order_which_can_not_refer_to_purchase_order)
        self.synchronizer.sync()

        self.assertEqual(ReleaseOrder.objects.count(), 0)

    def test_should_NOT_update_when_got_an_older_release_order(self):
        self.synchronizer._load_records = MagicMock(return_value=self.downloaded_release_orders)
        self.synchronizer.sync()
        older_release_order = [{"RELEASE_ORDER_NUMBER": u"0054155912",
                                "RELEASE_ORDER_ITEM": 10,
                                "RELEASE_ORDER_TYPE": "ZLO",
                                "SALES_UNIT": "EA",
                                "PLANT": "5631",
                                "SHIP_TO_PARTY": "L626010000",
                                "WAREHOUSE_NUMBER": "492",
                                "CONSIGNEE": "L626010384",
                                "DOCUMENT_DATE": u"/Date(1447390800000)/",
                                "GOODS_ISSUE_DATE": u"/Date(1448254800000)/",
                                "MATERIAL_NUMBER": "S0141021",
                                "DELIVERY_QUANTITY": 100,
                                "VALUE": 15030.86,
                                "MOVING_AVG_PRICE": 273.29,
                                "SO_NUMBER": u"0020173918",
                                "PO_NUMBER": u"0045143984",
                                "PO_ITEM": 10,
                                "WBS_ELEMENT": "6260\/A0\/05\/401\/005\/001",
                                "WAYBILL_NUMBER": u"0072124798",
                                "FORWARDER_NO": None,
                                "SHIPMENT_END_DATE": u"/Date(1440004800000)/",
                                "ACTUAL_SHIPMENT_START_DATE": None,
                                "SHIPMENT_COMPLETION_DATE": None,
                                "RELEASE_ORDER_CREATE_DATE": u"/Date(1440390800000)/",
                                "RELEASE_ORDER_UPDATE_DATE": u"/Date(1440390800000)/"}]
        self.synchronizer._load_records = MagicMock(return_value=older_release_order)
        self.synchronizer.sync()

        release_order = ReleaseOrder.objects.get(order_number=54155912)
        self.assertEqual(Consignee.objects.get(pk=release_order.consignee.id).customer_id, 'L626010384')

        release_order_item = ReleaseOrderItem.objects.get(release_order=release_order)
        self.assertEqual(release_order_item.quantity, 55)

    def test_should_update_when_got_a_newer_release_order(self):
        self.synchronizer._load_records = MagicMock(return_value=self.downloaded_release_orders)
        self.synchronizer.sync()
        newer_release_order = [{"RELEASE_ORDER_NUMBER": u"0054155912",
                                "RELEASE_ORDER_ITEM": 10,
                                "RELEASE_ORDER_TYPE": "ZLO",
                                "SALES_UNIT": "EA",
                                "PLANT": "5631",
                                "SHIP_TO_PARTY": "L626010384",
                                "WAREHOUSE_NUMBER": "492",
                                "CONSIGNEE": "L626010000",
                                "DOCUMENT_DATE": u"/Date(1447390800000)/",
                                "GOODS_ISSUE_DATE": u"/Date(1448254800000)/",
                                "MATERIAL_NUMBER": "S0141021",
                                "DELIVERY_QUANTITY": 100,
                                "VALUE": 15030.86,
                                "MOVING_AVG_PRICE": 273.29,
                                "SO_NUMBER": u"0020173918",
                                "PO_NUMBER": u"0045143984",
                                "PO_ITEM": 10,
                                "WBS_ELEMENT": "6260\/A0\/05\/401\/005\/001",
                                "WAYBILL_NUMBER": u"0072124798",
                                "FORWARDER_NO": None,
                                "SHIPMENT_END_DATE": u"/Date(1448254800000)/",
                                "ACTUAL_SHIPMENT_START_DATE": None,
                                "SHIPMENT_COMPLETION_DATE": None,
                                "RELEASE_ORDER_CREATE_DATE": u"/Date(1447390800000)/",
                                "RELEASE_ORDER_UPDATE_DATE": u"/Date(1448390800000)/"}]
        self.synchronizer._load_records = MagicMock(return_value=newer_release_order)
        self.synchronizer.sync()

        release_order = ReleaseOrder.objects.get(order_number=54155912)
        self.assertEqual(Consignee.objects.get(pk=release_order.consignee.id).customer_id, 'L626010000')

        release_order_item = ReleaseOrderItem.objects.get(release_order=release_order)
        self.assertEqual(release_order_item.quantity, 100)

    def _prepare_sales_and_purchase_order(self):
        Consignee.objects.create(customer_id='L626010000')
        Consignee.objects.create(customer_id='L626010384')
        self.programme_1 = Programme(wbs_element_ex='0060/A0/07/883')
        self.programme_1.save()
        self.programme_2 = Programme(wbs_element_ex='4380/A0/04/105')
        self.programme_2.save()
        self.sales_order_1 = SalesOrder(programme=self.programme_1,
                                        order_number=20173918,
                                        date=datetime.date(2015, 12, 3))
        self.sales_order_1.save()
        self.sales_order_2 = SalesOrder(programme=self.programme_2,
                                        order_number=20174363,
                                        date=datetime.date(2015, 12, 14))
        self.sales_order_2.save()

        self.purchase_order_1 = PurchaseOrder(order_number=45143984,
                                              sales_order=self.sales_order_1,
                                              date=datetime.date(2015, 11, 30),
                                              po_type='NB')
        self.purchase_order_1.save()
        self.purchase_order_2 = PurchaseOrder(order_number=45144863,
                                              sales_order=self.sales_order_2,
                                              date=datetime.date(2015, 12, 14),
                                              po_type='ZLC')
        self.purchase_order_2.save()

        self.item_1 = Item(description='Scale,electronic,mother/child,150kgx100g',
                           material_code='S0141021')
        self.item_1.save()
        self.item_2 = Item(description='Laundry soap, Carton, 25 bars, 800 grams',
                           material_code='SL009100')
        self.item_2.save()
        self.purchase_order_item_1 = PurchaseOrderItem(purchase_order=self.purchase_order_1,
                                                       item=self.item_1,
                                                       item_number=10,
                                                       sales_order_item=None,
                                                       quantity=100.00,
                                                       value=Decimal('51322.65'))
        self.purchase_order_item_1.save()
        self.purchase_order_item_2 = PurchaseOrderItem(purchase_order=self.purchase_order_2,
                                                       item=self.item_2,
                                                       item_number=20,
                                                       sales_order_item=None,
                                                       quantity=80.00,
                                                       value=Decimal('2673'))
        self.purchase_order_item_2.save()

    def _assert_release_order_equal(self, actual_release_order, expected_release_order):
        self.assertEqual(actual_release_order.order_number, expected_release_order.order_number)
        self.assertEqual(actual_release_order.waybill, expected_release_order.waybill)
        self.assertEqual(actual_release_order.delivery_date, expected_release_order.delivery_date)
        self.assertEqual(actual_release_order.delivery_date, expected_release_order.delivery_date)

    def _assert_release_order_item_equal(self, actual_release_order_item, expected_release_order_item_1):
        self._assert_release_order_equal(actual_release_order_item.release_order,
                                         expected_release_order_item_1.release_order)
        self.assertEqual(actual_release_order_item.item_number, expected_release_order_item_1.item_number)
        self.assertEqual(actual_release_order_item.quantity, expected_release_order_item_1.quantity)
        self.assertEqual(actual_release_order_item.value, expected_release_order_item_1.value)
