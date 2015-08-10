from eums.fixtures.flows import seed_flows
from eums.models import Option, Flow
from eums.models.question import MultipleChoiceQuestion, NumericQuestion, TextQuestion


def seed_questions_and_flows():
    flows = seed_flows()
    end_user_flow = flows['END_USER_FLOW']
    ip_flow = flows['IP_FLOW']
    web_flow = flows['WEB_FLOW']

    mc_question_1, _ = MultipleChoiceQuestion.objects.get_or_create(
        uuids=['2ff9fab3-4c12-400e-a2fe-4551fa1ebc18', '93bbd12e-417c-4789-9c42-6dc6959c03be',
               '53a31c08-896e-43b2-bd1f-e5a527d389b9', 'b8189435-a6b5-42a0-b5b0-91c95484dae1'],
        text='Was product received?', label='productReceived', flow=end_user_flow, position=1)

    Option.objects.get_or_create(text='Yes', question=mc_question_1)
    Option.objects.get_or_create(text='No', question=mc_question_1)

    question_2 = TextQuestion.objects.get_or_create(
        uuids=['abc9c005-7a7c-44f8-b946-e970a361b6cf', '884ed6d8-1cef-4878-999d-bce7de85e27c'],
        text='What date was it received?', label='dateOfReceipt', flow=end_user_flow, position=2)

    question_3, _ = NumericQuestion.objects.get_or_create(
        uuids=['69de6032-f4de-412a-9c9e-ed98fb9bca93', '9af2907a-d3a6-41ee-8a12-0b3197d30baf'],
        text='How much was received?', label='amountReceived', flow=end_user_flow, position=3)

    question_4, _ = MultipleChoiceQuestion.objects.get_or_create(
        uuids=['6c1cf92d-59b8-4bd3-815b-783abd3dfad9', 'fe368546-1b9c-4a15-926d-68b7caaa0380'],
        text='What is the quality of the product?', label='qualityOfProduct', flow=end_user_flow, position=4)
    Option.objects.get_or_create(text='Good', question=question_4)
    damaged, _ = Option.objects.get_or_create(text='Damaged', question=question_4)
    substandard, _ = Option.objects.get_or_create(text='Substandard', question=question_4)
    expired, _ = Option.objects.get_or_create(text='Expired', question=question_4)
    unclassified = question_4.option_set.get(text=MultipleChoiceQuestion.UNCATEGORISED)
    end_user_flow.end_nodes = [
        [question_4.id, damaged.id],
        [question_4.id, substandard.id],
        [question_4.id, expired.id],
        [question_4.id, unclassified.id]
    ]
    end_user_flow.save()

    question_5, _ = MultipleChoiceQuestion.objects.get_or_create(
        uuids=['7a5c8f57-5c3f-4659-b717-0de556898157', 'dc27480e-4931-46a8-9bea-ad0dadbec1d8'],
        text='Are you satisfied with the product?', label='satisfiedWithProduct', flow=end_user_flow, position=5)
    yes, _ = Option.objects.get_or_create(text='Yes', question=question_5)
    Option.objects.get_or_create(text='No', question=question_5)
    end_user_flow.end_nodes.append([question_5.id, yes.id])
    end_user_flow.save()

    question_6, _ = MultipleChoiceQuestion.objects.get_or_create(
        uuids=['18b2ea96-cb63-40d8-8c26-1985a944ff1c', '84150f15-b18b-4efa-be6b-ad24bc68a08f',
               '4e46a52d-8ea1-4bc4-824c-f8da74ce7ad0', '269aa1f7-7ca5-46f6-9bc0-6ad3fb7a5629'],
        text='Have you been informed of the delay?', label='informedOfDelay', flow=end_user_flow, position=6)
    Option.objects.get_or_create(text='Yes', question=question_6)
    no, _ = Option.objects.get_or_create(text='No', question=question_6)
    end_user_flow.end_nodes.append([question_6.id, no.id])
    end_user_flow.save()

    question_7, _ = TextQuestion.objects.get_or_create(
        uuids=['e9c35020-e751-4611-b222-5573b7040c49', '3f5d290a-067d-4cb9-bb09-ed7c424a6abd'],
        text='What did the partner say is the revised delivery date?', label='revisedDeliveryDate',
        flow=end_user_flow, position=7)
    end_user_flow.end_nodes.append([question_7.id, Flow.NO_OPTION])
    end_user_flow.save()

    question_8, _ = TextQuestion.objects.get_or_create(
        uuids=['4dd1a813-27d4-4511-82e3-cc470fcd3baa'],
        text='Feedback about Dissatisfaction', label='feedbackAboutDissatisfaction',
        flow=end_user_flow, position=8)
    end_user_flow.end_nodes.append([question_8.id, Flow.NO_OPTION])
    end_user_flow.save()

    ip_question_1, _ = MultipleChoiceQuestion.objects.get_or_create(
        uuids=['3ce26959-1e21-4cf6-98a1-c460b57e7ba5', '31e426cd-6934-4252-869f-4e1843691d4a'],
        text='Was delivery received?', label='deliveryReceived', flow=ip_flow, position=1)

    Option.objects.get_or_create(text='Yes', question=ip_question_1)
    no_delivery, _ = Option.objects.get_or_create(text='No', question=ip_question_1)
    ip_flow.end_nodes = []
    ip_flow.end_nodes.append([ip_question_1.id, no_delivery.id])
    ip_flow.save()

    ip_question_2, _ = TextQuestion.objects.get_or_create(
        uuids=['0f49db8d-432e-4d18-b596-408a0bb2eaa8'],
        text='When was delivery received?', label='dateOfReceipt', flow=ip_flow, position=2)

    ip_question_3, _ = MultipleChoiceQuestion.objects.get_or_create(
        uuids=['3762e25b-20e2-49fd-ad4f-0ccec08b4426'],
        text='Was delivery in good order?', label='isDeliveryInGoodOrder',
        flow=ip_flow, position=3)
    Option.objects.get_or_create(text='Yes', question=ip_question_3)
    Option.objects.get_or_create(text='No', question=ip_question_3)

    ip_question_4 = MultipleChoiceQuestion.objects.create(
        text="Are you satisfied with the product?",
        label="satisfiedWithProduct",
        flow=ip_flow, position=4,
        uuids=['7a5c8f57-5c3f-4659-b717-0de556898157', 'dc27480e-4931-46a8-9bea-ad0dadbec1d8'])
    Option.objects.create(text="No", question=ip_question_4)
    Option.objects.create(text="Yes", question=ip_question_4)

    ip_question_5, _ = TextQuestion.objects.get_or_create(
        uuids=['2fccd250-00a1-4740-b30e-3593b8f147a1'],
        text='Additional Remarks', label='additionalDeliveryComments', flow=ip_flow, position=5)

    ip_flow.end_nodes.append([ip_question_5.id, Flow.NO_OPTION])
    ip_flow.save()

    # Web questions
    qn_item_received_web, _ = MultipleChoiceQuestion.objects.get_or_create(
        uuids=[], text='Was the item received?', label='itemReceived', flow=web_flow,
        when_answered='update_consignee_inventory', position=1)

    Option.objects.get_or_create(text='Yes', question=qn_item_received_web)
    Option.objects.get_or_create(text='No', question=qn_item_received_web)

    NumericQuestion.objects.get_or_create(
        uuids=[], text='How much was received?', label='amountReceived', flow=web_flow,
        when_answered='update_consignee_stock_level')

    return flows
