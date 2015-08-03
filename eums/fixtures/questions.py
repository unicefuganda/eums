from eums.models import Option, Flow
from eums.models.question import MultipleChoiceQuestion, NumericQuestion, TextQuestion

END_USER_FLOW = Flow.objects.get(rapid_pro_id=2436)
MIDDLEMAN_FLOW = Flow.objects.get(rapid_pro_id=2662)
IMPLEMENTING_PARTNER = Flow.objects.get(rapid_pro_id=16995)


def seed_questions():
    question_1, _ = MultipleChoiceQuestion.objects.get_or_create(
        uuids=['2ff9fab3-4c12-400e-a2fe-4551fa1ebc18', '93bbd12e-417c-4789-9c42-6dc6959c03be',
               '53a31c08-896e-43b2-bd1f-e5a527d389b9', 'b8189435-a6b5-42a0-b5b0-91c95484dae1'],
        text='Was product received?', label='productReceived')

    Option.objects.get_or_create(text='Yes', question=question_1)
    Option.objects.get_or_create(text='No', question=question_1)

    TextQuestion.objects.get_or_create(
        uuids=['abc9c005-7a7c-44f8-b946-e970a361b6cf', '884ed6d8-1cef-4878-999d-bce7de85e27c'],
        text='What date was it received?', label='dateOfReceipt'
    )

    question_7, _ = NumericQuestion.objects.get_or_create(
        uuids=['69de6032-f4de-412a-9c9e-ed98fb9bca93', '9af2907a-d3a6-41ee-8a12-0b3197d30baf'],
        text='How much was received?', label='amountReceived'
    )
    MIDDLEMAN_FLOW.end_nodes = [[question_7.id, Flow.NO_OPTION]]
    MIDDLEMAN_FLOW.save()

    question_2, _ = MultipleChoiceQuestion.objects.get_or_create(
        uuids=['6c1cf92d-59b8-4bd3-815b-783abd3dfad9', 'fe368546-1b9c-4a15-926d-68b7caaa0380'],
        text='What is the quality of the product?', label='qualityOfProduct'
    )
    Option.objects.get_or_create(text='Good', question=question_2)
    damaged, _ = Option.objects.get_or_create(text='Damaged', question=question_2)
    substandard, _ = Option.objects.get_or_create(text='Substandard', question=question_2)
    expired, _ = Option.objects.get_or_create(text='Expired', question=question_2)
    unclassified = question_2.option_set.get(text=MultipleChoiceQuestion.UNCATEGORISED)
    END_USER_FLOW.end_nodes = [
        [question_2.id, damaged.id],
        [question_2.id, substandard.id],
        [question_2.id, expired.id],
        [question_2.id, unclassified.id]
    ]
    END_USER_FLOW.save()

    question_3, _ = MultipleChoiceQuestion.objects.get_or_create(
        uuids=['7a5c8f57-5c3f-4659-b717-0de556898157', 'dc27480e-4931-46a8-9bea-ad0dadbec1d8'],
        text='Are you satisfied with the product?', label='satisfiedWithProduct')
    yes, _ = Option.objects.get_or_create(text='Yes', question=question_3)
    Option.objects.get_or_create(text='No', question=question_3)
    END_USER_FLOW.end_nodes.append([question_3.id, yes.id])
    END_USER_FLOW.save()

    question_4, _ = MultipleChoiceQuestion.objects.get_or_create(
        uuids=['18b2ea96-cb63-40d8-8c26-1985a944ff1c', '84150f15-b18b-4efa-be6b-ad24bc68a08f',
               '4e46a52d-8ea1-4bc4-824c-f8da74ce7ad0', '269aa1f7-7ca5-46f6-9bc0-6ad3fb7a5629'],
        text='Have you been informed of the delay?', label='informedOfDelay'
    )
    Option.objects.get_or_create(text='Yes', question=question_4)
    no, _ = Option.objects.get_or_create(text='No', question=question_4)
    END_USER_FLOW.end_nodes.append([question_4.id, no.id])
    END_USER_FLOW.save()
    MIDDLEMAN_FLOW.end_nodes.append([question_4.id, no.id])
    MIDDLEMAN_FLOW.save()

    question_5, _ = TextQuestion.objects.get_or_create(
        uuids=['e9c35020-e751-4611-b222-5573b7040c49', '3f5d290a-067d-4cb9-bb09-ed7c424a6abd'],
        text='What did the partner say is the revised delivery date?', label='revisedDeliveryDate'
    )
    END_USER_FLOW.end_nodes.append([question_5.id, Flow.NO_OPTION])
    END_USER_FLOW.save()
    MIDDLEMAN_FLOW.end_nodes.append([question_5.id, Flow.NO_OPTION])
    MIDDLEMAN_FLOW.save()

    question_6, _ = TextQuestion.objects.get_or_create(
        uuids=['4dd1a813-27d4-4511-82e3-cc470fcd3baa'],
        text='Feedback about Dissatisfaction', label='feedbackAboutDissatisfaction'
    )
    END_USER_FLOW.end_nodes.append([question_6.id, Flow.NO_OPTION])
    END_USER_FLOW.save()

    question_8, _ = MultipleChoiceQuestion.objects.get_or_create(
        uuids=['2e2006cb-dc98-42ed-9df8-1e31ec6c6909', '7ac53029-eafe-4346-924f-4cb9e4bed949'],
        text='Was delivery received?', label='deliveryReceived')
    Option.objects.get_or_create(text='Yes', question=question_8)
    no_delivery, _ = Option.objects.get_or_create(text='No', question=question_8)
    IMPLEMENTING_PARTNER.end_nodes = []
    IMPLEMENTING_PARTNER.end_nodes.append([question_8.id, no_delivery.id])
    IMPLEMENTING_PARTNER.save()

    question_9, _ = TextQuestion.objects.get_or_create(
        uuids=[' 5d281023-92a9-4c61-849d-0f8a706626a3'],
        text='When was delivery received?', label='dateOfReceiptOfDelivery')

    question_10, _ = MultipleChoiceQuestion.objects.get_or_create(
        uuids=['80fca7ae-6415-46a3-9b67-6fd1d1b23281'],
        text='Was delivery in good order?', label='isDeliveryInGoodOrder')
    yes_delivery, _ = Option.objects.get_or_create(text='Yes', question=question_10)
    no_delivery, _ = Option.objects.get_or_create(text='No', question=question_10)

    question_11, _ = TextQuestion.objects.get_or_create(
        uuids=['5d5728d6-8bd9-42d3-9f7d-423360dcd370'],
        text='Additional Remarks', label='additionalDeliveryComments')
    IMPLEMENTING_PARTNER.end_nodes.append([question_11.id, Flow.NO_OPTION])
    IMPLEMENTING_PARTNER.save()
