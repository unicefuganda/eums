from eums.models import ReleaseOrderItem, DistributionPlanNode, NumericAnswer, TextAnswer, \
    MultipleChoiceAnswer
import json


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


def serialise_item(item):
    item_json = _extract_clean_fields(item)
    item_json['unit'] = item.unit.name if item.unit else 'null'
    return item_json


def serialise_sales_order(sales_order):
    return _extract_clean_fields(sales_order)


def serialise_release_order_item(item):
    ro_item_json = _extract_clean_fields(item)
    ro_item_json['release_order'] = serialise_release_order(item.release_order)
    ro_item_json['item'] = serialise_item(item.item)
    return ro_item_json


def serialise_purchase_order_item(item):
    po_item_json = _extract_clean_fields(item)
    po_item_json['purchase_order'] = serialise_purchase_order(item.purchase_order)
    po_item_json['item'] = serialise_item(item.item)
    return po_item_json


def serialise_order_item(order_item):
    if isinstance(order_item, ReleaseOrderItem):
        return serialise_release_order_item(order_item)
    return serialise_purchase_order_item(order_item)


def serialise_node(node):
    node_json = _extract_clean_fields(node)
    node_json['consignee'] = serialise_consignee(node.consignee)
    node_json['programme'] = serialise_programme(node.programme)
    node_json['order_item'] = serialise_order_item(node.item)
    node_json['responses'] = serialise_node_responses(node)
    if node.ip:
        node_json['ip'] = serialise_consignee(node.ip)
    return node_json


def serialise_node_responses(node):
    numeric_answers = NumericAnswer.objects.filter(run__runnable=node)
    text_answers = TextAnswer.objects.filter(run__runnable=node)
    multiple_choice_answers = MultipleChoiceAnswer.objects.filter(run__runnable=node)
    serialised_simple = map(lambda answer: serialise_simple_answer(answer), list(numeric_answers) + list(text_answers))
    serialised_multiple = map(lambda answer: serialise_multiple_choice_answer(answer), multiple_choice_answers)
    return serialised_simple + serialised_multiple


def serialise_simple_answer(answer):
    answer_json = _extract_clean_fields(answer)
    answer_json['question'] = serialise_question(answer.question)
    answer_json['run'] = serialise_run(answer.run)
    return answer_json


def serialise_multiple_choice_answer(answer):
    answer_json = _extract_clean_fields(answer)
    answer_json['run'] = serialise_run(answer.run)
    answer_json['question'] = serialise_question(answer.question)
    answer_json['value'] = answer.value.text
    return answer_json


def serialise_question(question):
    return _extract_clean_fields(question)


def serialise_run(run):
    return _extract_clean_fields(run)


def serialise_nodes():
    nodes = DistributionPlanNode.objects.all()
    serialised = []
    for node in nodes:
        serialised.append({'index': {'_index': 'eums', '_type': 'delivery_node', '_id': node.id}})
        serialised.append(serialise_node(node))
    return serialised


def serialise_datetime(datetime):
    return str(datetime)


def convert_to_bulk_api_format(node_dicts):
    json_string = ''
    for node_dict in node_dicts:
        json_string += json.dumps(node_dict, default=serialise_datetime)
        json_string += '\n'
    return json_string

serialised_nodes = serialise_nodes()

outfile = open('eums/elasticsearch/nodes.es', 'w')
outfile.write(convert_to_bulk_api_format(serialised_nodes))
