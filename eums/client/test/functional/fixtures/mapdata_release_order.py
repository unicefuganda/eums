from eums.client.test.functional.fixtures.mapdata_purchase_order import *
from eums.client.test.functional.fixtures.mapdata_consignees import *
from eums.client.test.functional.fixtures.mapdata_sales_order import *
from eums.models import ReleaseOrder
from eums.test.helpers.fake_datetime import FakeDate

ro_1 = ReleaseOrder.objects.create(sales_order=sales_order_105, waybill=72082647, consignee=consignee_1, purchase_order=po_106, order_number=54102852, delivery_date=FakeDate.build(2014, 8, 19))
ro_2 = ReleaseOrder.objects.create(sales_order=sales_order_105, waybill=72089797, consignee=consignee_44, purchase_order=po_106, order_number=54109789, delivery_date=FakeDate.build(2014, 11, 6))
ro_3 = ReleaseOrder.objects.create(sales_order=sales_order_105, waybill=72088441, consignee=consignee_38, purchase_order=po_106, order_number=54110379, delivery_date=FakeDate.build(2014, 10, 23))
ro_4 = ReleaseOrder.objects.create(sales_order=sales_order_105, waybill=72090975, consignee=consignee_44, purchase_order=po_106, order_number=54112876, delivery_date=FakeDate.build(2014, 11, 18))
ro_5 = ReleaseOrder.objects.create(sales_order=sales_order_105, waybill=72102556, consignee=consignee_44, purchase_order=po_106, order_number=54127722, delivery_date=FakeDate.build(2015, 3, 25))
ro_6 = ReleaseOrder.objects.create(sales_order=sales_order_105, waybill=72077697, consignee=consignee_45, purchase_order=po_106, order_number=57006881, delivery_date=FakeDate.build(2014, 6, 25))
ro_7 = ReleaseOrder.objects.create(sales_order=sales_order_106, waybill=72077574, consignee=consignee_27, purchase_order=po_106, order_number=57006875, delivery_date=FakeDate.build(2014, 6, 25))
