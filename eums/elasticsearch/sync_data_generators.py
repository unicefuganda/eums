from collections import namedtuple
from django.conf import settings
from elasticsearch import Elasticsearch
from elasticsearch.helpers import scan
from eums.elasticsearch.delete_records import DeleteRecords

from eums.elasticsearch.mappings import setup_mappings
from eums.elasticsearch.sync_info import SyncInfo
from eums.models import DistributionPlanNode as DeliveryNode, Consignee, Programme, OrderItem, Item, SalesOrder, \
    PurchaseOrder, ReleaseOrder, Question, TextAnswer, MultipleChoiceAnswer, NumericAnswer, Option, Run

ES_SETTINGS = settings.ELASTIC_SEARCH


def list_nodes_to_update():
    last_sync = SyncInfo.last_successful_sync()
    nodes_to_update = _find_nodes_to_update(last_sync)
    new_nodes = _find_new_nodes(last_sync)
    return list(nodes_to_update) + list(new_nodes)


def list_nodes_to_delete():
    delete_records = DeleteRecords.objects.first()
    return delete_records.nodes_to_delete if delete_records else []


def _find_new_nodes(last_sync):
    if not last_sync:
        setup_mappings()
        return DeliveryNode.objects.all()
    last_sync_time = last_sync.start_time
    return DeliveryNode.objects.filter(created__gte=last_sync_time)


def _find_nodes_to_update(last_sync):
    if last_sync:
        changed_nodes = DeliveryNode.objects.filter(modified__gte=last_sync.start_time)

        es = Elasticsearch([ES_SETTINGS.HOST])
        match_terms = _build_match_terms(last_sync)
        if not match_terms:
            return changed_nodes

        query = {
            "fields": [],
            "filter": {
                "bool": {
                    "should": match_terms
                }
            }
        }

        scan_results = scan(es, query=query, index=ES_SETTINGS.INDEX, doc_type=ES_SETTINGS.NODE_TYPE)
        node_ids = [hit['_id'] for hit in list(scan_results)]
        changed_node_ids = list(changed_nodes.values_list('id', flat=True))
        return DeliveryNode.objects.filter(pk__in=node_ids + changed_node_ids)
    return []


def _build_match_terms(last_sync):
    last_sync_time = last_sync.start_time
    consignee_ids = _find_changes_for_model(Consignee, last_sync_time)
    programme_ids = _find_changes_for_model(Programme, last_sync_time)
    order_item_ids = _find_changes_for_model(OrderItem, last_sync_time)
    item_ids = _find_changes_for_model(Item, last_sync_time)
    sales_order_ids = _find_changes_for_model(SalesOrder, last_sync_time)
    purchase_order_ids = _find_changes_for_model(PurchaseOrder, last_sync_time)
    release_order_ids = _find_changes_for_model(ReleaseOrder, last_sync_time)
    question_ids = _find_changes_for_model(Question, last_sync_time)
    text_answer_ids = _find_changes_for_model(TextAnswer, last_sync_time)
    multiple_choice_answer_ids = _find_changes_for_model(MultipleChoiceAnswer, last_sync_time)
    numeric_answer_ids = _find_changes_for_model(NumericAnswer, last_sync_time)
    option_ids = _find_changes_for_model(Option, last_sync_time)
    run_ids = _find_changes_for_model(Run, last_sync_time)

    match_term = namedtuple('MatchTerm', ['key', 'value'])
    match_terms = [
        match_term("consignee.id", consignee_ids),
        match_term("ip.id", consignee_ids),
        match_term("programme.id", programme_ids),
        match_term("order_item.id", order_item_ids),
        match_term("order_item.item.id", item_ids),
        match_term("order_item.order.sales_order.id", sales_order_ids),
        match_term("order_item.order.id", purchase_order_ids + release_order_ids),
        match_term("responses.question.id", question_ids),
        match_term("responses.id", text_answer_ids + multiple_choice_answer_ids + numeric_answer_ids),
        match_term("responses.value_id", option_ids),
        match_term("responses.run.id", run_ids),
    ]

    non_empty_match_terms = filter(lambda term: len(term.value), match_terms)
    if non_empty_match_terms:
        formatted_match_terms = map(lambda term: {'term': {term.key: term.value}}, non_empty_match_terms)
        return formatted_match_terms
    return None


def _find_changes_for_model(model, last_sync_time):
    return list(model.objects.filter(modified__gte=last_sync_time).values_list('id', flat=True))
