from eums.models import MultipleChoiceQuestion, Option, TextQuestion, NumericQuestion, Flow


def setup_end_user_flow_questions(flow):
    question_1, _ = MultipleChoiceQuestion.objects.get_or_create(
        uuids=['2ff9fab3-4c12-400e-a2fe-4551fa1ebc18', '93bbd12e-417c-4789-9c42-6dc6959c03be',
               '53a31c08-896e-43b2-bd1f-e5a527d389b9', 'b8189435-a6b5-42a0-b5b0-91c95484dae1'],
        text='Was product received?', label='productReceived', flow=flow, position=1)
    Option.objects.get_or_create(text='Yes', question=question_1)
    Option.objects.get_or_create(text='No', question=question_1)

    question_2 = TextQuestion.objects.get_or_create(
        uuids=['abc9c005-7a7c-44f8-b946-e970a361b6cf', '884ed6d8-1cef-4878-999d-bce7de85e27c'],
        text='What date was it received?', label='dateOfReceipt', flow=flow, position=2)

    question_3, _ = NumericQuestion.objects.get_or_create(
        uuids=['69de6032-f4de-412a-9c9e-ed98fb9bca93', '9af2907a-d3a6-41ee-8a12-0b3197d30baf'],
        text='How much was received?', label='amountReceived', flow=flow, position=3)

    question_4, _ = MultipleChoiceQuestion.objects.get_or_create(
        uuids=['6c1cf92d-59b8-4bd3-815b-783abd3dfad9', 'fe368546-1b9c-4a15-926d-68b7caaa0380'],
        text='What is the quality of the product?', label='qualityOfProduct', flow=flow, position=4)
    Option.objects.get_or_create(text='Good', question=question_4)
    damaged, _ = Option.objects.get_or_create(text='Damaged', question=question_4)
    substandard, _ = Option.objects.get_or_create(text='Substandard', question=question_4)
    expired, _ = Option.objects.get_or_create(text='Expired', question=question_4)
    unclassified = question_4.option_set.get(text=MultipleChoiceQuestion.UNCATEGORISED)
    flow.end_nodes = [
        [question_4.id, damaged.id],
        [question_4.id, substandard.id],
        [question_4.id, expired.id],
        [question_4.id, unclassified.id]
    ]
    flow.save()

    question_5, _ = MultipleChoiceQuestion.objects.get_or_create(
        uuids=['7a5c8f57-5c3f-4659-b717-0de556898157', 'dc27480e-4931-46a8-9bea-ad0dadbec1d8'],
        text='Are you satisfied with the product?', label='satisfiedWithProduct', flow=flow, position=5)
    yes, _ = Option.objects.get_or_create(text='Yes', question=question_5)
    Option.objects.get_or_create(text='No', question=question_5)
    flow.end_nodes.append([question_5.id, yes.id])
    flow.save()

    question_6, _ = MultipleChoiceQuestion.objects.get_or_create(
        uuids=['18b2ea96-cb63-40d8-8c26-1985a944ff1c', '84150f15-b18b-4efa-be6b-ad24bc68a08f',
               '4e46a52d-8ea1-4bc4-824c-f8da74ce7ad0', '269aa1f7-7ca5-46f6-9bc0-6ad3fb7a5629'],
        text='Have you been informed of the delay?', label='informedOfDelay', flow=flow, position=6)
    Option.objects.get_or_create(text='Yes', question=question_6)
    no, _ = Option.objects.get_or_create(text='No', question=question_6)
    flow.end_nodes.append([question_6.id, no.id])
    flow.save()

    question_7, _ = TextQuestion.objects.get_or_create(
        uuids=['e9c35020-e751-4611-b222-5573b7040c49', '3f5d290a-067d-4cb9-bb09-ed7c424a6abd'],
        text='What did the partner say is the revised delivery date?', label='revisedDeliveryDate',
        flow=flow, position=7)
    flow.end_nodes.append([question_7.id, Flow.NO_OPTION])
    flow.save()

    question_8, _ = TextQuestion.objects.get_or_create(
        uuids=['4dd1a813-27d4-4511-82e3-cc470fcd3baa'],
        text='Feedback about Dissatisfaction', label='feedbackAboutDissatisfaction',
        flow=flow, position=8)
    flow.end_nodes.append([question_8.id, Flow.NO_OPTION])
    flow.save()
