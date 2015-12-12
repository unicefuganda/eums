from eums.models import MultipleChoiceQuestion, Option, TextQuestion, NumericQuestion, Flow, Runnable

WAS_PRODUCT_RECEIVED = None
PRODUCT_WAS_RECEIVED = None
PRODUCT_WAS_NOT_RECEIVED = None
EU_DATE_RECEIVED = None
EU_AMOUNT_RECEIVED = None
EU_QUALITY_OF_PRODUCT = None
EU_SATISFACTION = None
EU_INFORMED_OF_DELAY = None
EU_REVISED_DELIVERY_DATE = None
EU_DISSATISFACTION_FEEDBACK = None
EU_OPT_DAMAGED = None
EU_OPT_GOOD = None
EU_OPT_SATISFIED = None
EU_OPT_NOT_SATISFIED = None
EU_OPT_EXPIRED = None
END_USER_FLOW = None


def seed_questions():
    global WAS_PRODUCT_RECEIVED, PRODUCT_WAS_RECEIVED, PRODUCT_WAS_NOT_RECEIVED, EU_DATE_RECEIVED, EU_AMOUNT_RECEIVED
    global EU_QUALITY_OF_PRODUCT, EU_SATISFACTION, EU_INFORMED_OF_DELAY, EU_REVISED_DELIVERY_DATE, EU_OPT_EXPIRED
    global EU_DISSATISFACTION_FEEDBACK, EU_OPT_DAMAGED, EU_OPT_GOOD, EU_OPT_SATISFIED, EU_OPT_NOT_SATISFIED
    global END_USER_FLOW

    END_USER_FLOW, _ = Flow.objects.get_or_create(rapid_pro_id=2436, label=Flow.Label.END_USER)

    WAS_PRODUCT_RECEIVED, _ = MultipleChoiceQuestion.objects.get_or_create(
        uuids=['2ff9fab3-4c12-400e-a2fe-4551fa1ebc18', '93bbd12e-417c-4789-9c42-6dc6959c03be',
               '53a31c08-896e-43b2-bd1f-e5a527d389b9', 'b8189435-a6b5-42a0-b5b0-91c95484dae1'],
        text='Was product received?', label='productReceived', flow=END_USER_FLOW, position=1)

    PRODUCT_WAS_RECEIVED, _ = Option.objects.get_or_create(text='Yes', question=WAS_PRODUCT_RECEIVED)
    PRODUCT_WAS_NOT_RECEIVED, _ = Option.objects.get_or_create(text='No', question=WAS_PRODUCT_RECEIVED)

    EU_DATE_RECEIVED, _ = TextQuestion.objects.get_or_create(
        uuids=['abc9c005-7a7c-44f8-b946-e970a361b6cf', '884ed6d8-1cef-4878-999d-bce7de85e27c'],
        text='What date was it received?', label='dateOfReceipt', flow=END_USER_FLOW, position=2)

    EU_AMOUNT_RECEIVED, _ = NumericQuestion.objects.get_or_create(
        uuids=['69de6032-f4de-412a-9c9e-ed98fb9bca93', '9af2907a-d3a6-41ee-8a12-0b3197d30baf'],
        text='How much was received?', label='amountReceived', flow=END_USER_FLOW, position=3)

    EU_QUALITY_OF_PRODUCT, _ = MultipleChoiceQuestion.objects.get_or_create(
        uuids=['6c1cf92d-59b8-4bd3-815b-783abd3dfad9', 'fe368546-1b9c-4a15-926d-68b7caaa0380'],
        text='What is the quality of the product?', label='qualityOfProduct', flow=END_USER_FLOW, position=4)
    EU_OPT_GOOD, _ = Option.objects.get_or_create(text='Good', question=EU_QUALITY_OF_PRODUCT)
    EU_OPT_DAMAGED, _ = Option.objects.get_or_create(text='Damaged', question=EU_QUALITY_OF_PRODUCT)
    eu_opt_substandard, _ = Option.objects.get_or_create(text='Substandard', question=EU_QUALITY_OF_PRODUCT)
    EU_OPT_EXPIRED, _ = Option.objects.get_or_create(text='Expired', question=EU_QUALITY_OF_PRODUCT)
    eu_opt_incomplete, _ = Option.objects.get_or_create(text='Incomplete', question=EU_QUALITY_OF_PRODUCT)
    END_USER_FLOW.end_nodes = [
        [EU_QUALITY_OF_PRODUCT.id, EU_OPT_DAMAGED.id],
        [EU_QUALITY_OF_PRODUCT.id, eu_opt_substandard.id],
        [EU_QUALITY_OF_PRODUCT.id, EU_OPT_EXPIRED.id],
        [EU_QUALITY_OF_PRODUCT.id, eu_opt_incomplete.id]
    ]
    END_USER_FLOW.save()

    EU_SATISFACTION, _ = MultipleChoiceQuestion.objects.get_or_create(
        uuids=['7a5c8f57-5c3f-4659-b717-0de556898157', 'dc27480e-4931-46a8-9bea-ad0dadbec1d8'],
        text='Are you satisfied with the product?', label='satisfiedWithProduct', flow=END_USER_FLOW, position=5)
    EU_OPT_SATISFIED, _ = Option.objects.get_or_create(text='Yes', question=EU_SATISFACTION)
    EU_OPT_NOT_SATISFIED, _ = Option.objects.get_or_create(text='No', question=EU_SATISFACTION)
    END_USER_FLOW.end_nodes.append([EU_SATISFACTION.id, EU_OPT_SATISFIED.id])
    END_USER_FLOW.save()

    EU_INFORMED_OF_DELAY, _ = MultipleChoiceQuestion.objects.get_or_create(
        uuids=['18b2ea96-cb63-40d8-8c26-1985a944ff1c', '84150f15-b18b-4efa-be6b-ad24bc68a08f',
               '4e46a52d-8ea1-4bc4-824c-f8da74ce7ad0', '269aa1f7-7ca5-46f6-9bc0-6ad3fb7a5629'],
        text='Have you been informed of the delay?', label='informedOfDelay', flow=END_USER_FLOW, position=6)
    eu_q6_option_yes, _ = Option.objects.get_or_create(text='Yes', question=EU_INFORMED_OF_DELAY)
    eu_q6_option_no, _ = Option.objects.get_or_create(text='No', question=EU_INFORMED_OF_DELAY)
    END_USER_FLOW.end_nodes.append([EU_INFORMED_OF_DELAY.id, eu_q6_option_no.id])
    END_USER_FLOW.save()

    EU_REVISED_DELIVERY_DATE, _ = TextQuestion.objects.get_or_create(
        uuids=['e9c35020-e751-4611-b222-5573b7040c49', '3f5d290a-067d-4cb9-bb09-ed7c424a6abd'],
        text='What did the partner say is the revised delivery date?', label='revisedDeliveryDate',
        flow=END_USER_FLOW, position=7)
    END_USER_FLOW.end_nodes.append([EU_REVISED_DELIVERY_DATE.id, Flow.NO_OPTION])
    END_USER_FLOW.save()

    EU_DISSATISFACTION_FEEDBACK, _ = TextQuestion.objects.get_or_create(
        uuids=['4dd1a813-27d4-4511-82e3-cc470fcd3baa'],
        text='Feedback about Dissatisfaction', label='feedbackAboutDissatisfaction',
        flow=END_USER_FLOW, position=8)
    END_USER_FLOW.end_nodes.append([EU_DISSATISFACTION_FEEDBACK.id, Flow.NO_OPTION])
    END_USER_FLOW.save()

    questions = {
        'WAS_PRODUCT_RECEIVED': WAS_PRODUCT_RECEIVED,
        'QUALITY_OF_PRODUCT': EU_QUALITY_OF_PRODUCT,
        'SATISFACTION_WITH_PRODUCT': EU_SATISFACTION,
        'EU_AMOUNT_RECEIVED': EU_AMOUNT_RECEIVED,
        'EU_DATE_RECEIVED': EU_DATE_RECEIVED
    }
    options = {
        'PRODUCT_WAS_RECEIVED': PRODUCT_WAS_RECEIVED,
        'PRODUCT_WAS_NOT_RECEIVED': PRODUCT_WAS_NOT_RECEIVED,
        'IN_GOOD_CONDITION': EU_OPT_GOOD,
        'DAMAGED': EU_OPT_DAMAGED,
        'SUB_STANDARD': eu_opt_substandard,
        'EXPIRED': EU_OPT_EXPIRED,
        'INCOMPLETE': eu_opt_incomplete,
        'SATISFIED': EU_OPT_SATISFIED,
        'NOT_SATISFIED': EU_OPT_NOT_SATISFIED
    }
    return questions, options


seed_questions()
