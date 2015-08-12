from eums.models import MultipleChoiceQuestion, Option, NumericQuestion


def setup_web_flow_questions(flow):
    qn_item_received_web, _ = MultipleChoiceQuestion.objects.get_or_create(
        uuids=[], text='Was the item received?', label='itemReceived', flow=flow,
        when_answered='update_consignee_inventory', position=1)
    Option.objects.get_or_create(text='Yes', question=qn_item_received_web)
    Option.objects.get_or_create(text='No', question=qn_item_received_web)
    NumericQuestion.objects.get_or_create(
        uuids=[], text='How much was received?', label='amountReceived', flow=flow,
        when_answered='update_consignee_stock_level', position=2)
