from eums.models import ReleaseOrderItem, PurchaseOrderItem, DistributionPlanNode


def _extract_clean_fields(obj):
    obj_json = obj.__dict__.copy()
    bad_keys = filter(lambda key: key.startswith('_'), obj_json.keys())
    [obj_json.pop(bad_key) for bad_key in bad_keys]
    return obj_json


def serialise_consignee(consignee):
    return _extract_clean_fields(consignee)


def serialise_programme(programme):
    return _extract_clean_fields(programme)


def serialise_release_order(release_order):
    ro_json = _extract_clean_fields(release_order)
    ro_json['sales_order'] = serialise_sales_order(release_order.sales_order)
    ro_json['purchase_order'] = serialise_sales_order(release_order.purchase_order)
    ro_json['document_type'] = 'release_order'
    return ro_json


def serialise_purchase_order(purchase_order):
    po_json = _extract_clean_fields(purchase_order)
    po_json['sales_order'] = serialise_sales_order(purchase_order.sales_order)
    po_json['document_type'] = 'purchase_order'
    return po_json


def serialise_sales_order(sales_order):
    return _extract_clean_fields(sales_order)


def serialise_release_order_item(item_id):
    release_order_item = ReleaseOrderItem.objects.get(pk=item_id)
    ro_item_json = _extract_clean_fields(release_order_item)
    ro_item_json['release_order'] = serialise_release_order(release_order_item.release_order)
    return ro_item_json


def serialise_purchase_order_item(item_id):
    purchase_order_item = PurchaseOrderItem.objects.get(pk=item_id)
    po_item_json = _extract_clean_fields(purchase_order_item)
    po_item_json['purchase_order'] = serialise_purchase_order(purchase_order_item.purchase_order)
    return po_item_json


def serialise_order_item(order_item):
    if isinstance(order_item, ReleaseOrderItem):
        return serialise_release_order_item(order_item.id)
    return serialise_purchase_order_item(order_item.id)


def serialise_node(node):
    node_json = _extract_clean_fields(node)
    node_json['consignee'] = serialise_consignee(node.consignee)
    node_json['programme'] = serialise_programme(node.programme)
    node_json['order_item'] = serialise_order_item(node.item)
    return node_json


def serialise_nodes():
    nodes = DistributionPlanNode.objects.all()
    return map(lambda node: serialise_node(node), nodes)


serialised_nodes = serialise_nodes()
print serialised_nodes
