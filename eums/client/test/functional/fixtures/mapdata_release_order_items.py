from eums.client.test.functional.fixtures.mapdata_purchase_order_items import *
from eums.client.test.functional.fixtures.mapdata_release_order import *
from eums.models import ReleaseOrderItem

ro_item_430 = ReleaseOrderItem.objects.create(purchase_order_item=po_item_429, release_order=ro_1, value=8999.05, item=item_174, item_number=10, quantity=50.00)
ro_item_431 = ReleaseOrderItem.objects.create(purchase_order_item=po_item_429, release_order=ro_2, value=179.98, item=item_174, item_number=10, quantity=1.00)
ro_item_432 = ReleaseOrderItem.objects.create(purchase_order_item=po_item_429, release_order=ro_3, value=359.96, item=item_174, item_number=30, quantity=2.00)
ro_item_433 = ReleaseOrderItem.objects.create(purchase_order_item=po_item_429, release_order=ro_4, value=179.98, item=item_174, item_number=10, quantity=1.00)
ro_item_434 = ReleaseOrderItem.objects.create(purchase_order_item=po_item_429, release_order=ro_5, value=1259.87, item=item_174, item_number=10, quantity=7.00)
ro_item_435 = ReleaseOrderItem.objects.create(purchase_order_item=po_item_429, release_order=ro_6, value=1799.80, item=item_174, item_number=10, quantity=10.00)
ro_item_436 = ReleaseOrderItem.objects.create(purchase_order_item=po_item_429, release_order=ro_7, value=1799.80, item=item_174, item_number=10, quantity=3.00)
