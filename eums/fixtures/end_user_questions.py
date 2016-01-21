from eums.models import MultipleChoiceQuestion, Option, TextQuestion, NumericQuestion, Flow

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
EU_SATISFACTION_FEEDBACK = None
EU_NOTGOODCOMMENT_FEEDBACK = None
END_USER_FLOW = None


def seed_questions():
    global WAS_PRODUCT_RECEIVED, PRODUCT_WAS_RECEIVED, PRODUCT_WAS_NOT_RECEIVED, EU_DATE_RECEIVED, EU_AMOUNT_RECEIVED
    global EU_QUALITY_OF_PRODUCT, EU_SATISFACTION, EU_INFORMED_OF_DELAY, EU_REVISED_DELIVERY_DATE, EU_OPT_EXPIRED
    global EU_OPT_DAMAGED, EU_OPT_GOOD, EU_OPT_SATISFIED, EU_OPT_NOT_SATISFIED
    global EU_DISSATISFACTION_FEEDBACK, EU_SATISFACTION_FEEDBACK, EU_NOTGOODCOMMENT_FEEDBACK
    global END_USER_FLOW

    END_USER_FLOW, _ = Flow.objects.get_or_create(label=Flow.Label.END_USER)
    END_USER_FLOW.end_nodes = []

    WAS_PRODUCT_RECEIVED, _ = MultipleChoiceQuestion.objects.get_or_create(
            text='Was product received?', label='productReceived', flow=END_USER_FLOW, position=1)
    PRODUCT_WAS_RECEIVED, _ = Option.objects.get_or_create(text='Yes', question=WAS_PRODUCT_RECEIVED)
    PRODUCT_WAS_NOT_RECEIVED, _ = Option.objects.get_or_create(text='No', question=WAS_PRODUCT_RECEIVED)

    EU_DATE_RECEIVED, _ = TextQuestion.objects.get_or_create(
            text='What date was it received?', label='dateOfReceipt', flow=END_USER_FLOW, position=2)

    EU_INFORMED_OF_DELAY, _ = MultipleChoiceQuestion.objects.get_or_create(
            text='Have you been informed of the delay?', label='informedOfDelay', flow=END_USER_FLOW, position=2)
    eu_informed_of_delay_yes, _ = Option.objects.get_or_create(text='Yes', question=EU_INFORMED_OF_DELAY)
    eu_informed_of_delay_no, _ = Option.objects.get_or_create(text='No', question=EU_INFORMED_OF_DELAY)
    END_USER_FLOW.end_nodes.append([EU_INFORMED_OF_DELAY.id, eu_informed_of_delay_no.id])
    END_USER_FLOW.save()

    EU_AMOUNT_RECEIVED, _ = NumericQuestion.objects.get_or_create(
            text='How much was received?', label='amountReceived', flow=END_USER_FLOW, position=3)

    EU_REVISED_DELIVERY_DATE, _ = TextQuestion.objects.get_or_create(
            text='What did the partner say is the revised delivery date?', label='revisedDeliveryDate',
            flow=END_USER_FLOW, position=3)
    END_USER_FLOW.end_nodes.append([EU_REVISED_DELIVERY_DATE.id, Flow.NO_OPTION])
    END_USER_FLOW.save()

    EU_QUALITY_OF_PRODUCT, _ = MultipleChoiceQuestion.objects.get_or_create(
            text='What is the quality of the product?', label='qualityOfProduct', flow=END_USER_FLOW, position=4)
    EU_OPT_GOOD, _ = Option.objects.get_or_create(text='Good', question=EU_QUALITY_OF_PRODUCT)
    EU_OPT_DAMAGED, _ = Option.objects.get_or_create(text='Damaged', question=EU_QUALITY_OF_PRODUCT)
    EU_OPT_SUBSTANDARD, _ = Option.objects.get_or_create(text='Substandard', question=EU_QUALITY_OF_PRODUCT)
    EU_OPT_EXPIRED, _ = Option.objects.get_or_create(text='Expired', question=EU_QUALITY_OF_PRODUCT)
    EU_OPT_INCOMPLETE, _ = Option.objects.get_or_create(text='Incomplete', question=EU_QUALITY_OF_PRODUCT)
    EU_OPT_OTHER, _ = Option.objects.get_or_create(text='Other', question=EU_QUALITY_OF_PRODUCT)
    END_USER_FLOW.end_nodes.append([EU_QUALITY_OF_PRODUCT.id, EU_OPT_DAMAGED.id])
    END_USER_FLOW.end_nodes.append([EU_QUALITY_OF_PRODUCT.id, EU_OPT_SUBSTANDARD.id])
    END_USER_FLOW.end_nodes.append([EU_QUALITY_OF_PRODUCT.id, EU_OPT_EXPIRED.id])
    END_USER_FLOW.end_nodes.append([EU_QUALITY_OF_PRODUCT.id, EU_OPT_INCOMPLETE.id])
    END_USER_FLOW.end_nodes.append([EU_QUALITY_OF_PRODUCT.id, EU_OPT_OTHER.id])
    END_USER_FLOW.save()

    EU_SATISFACTION, _ = MultipleChoiceQuestion.objects.get_or_create(
            text='Are you satisfied with the product?', label='satisfiedWithProduct', flow=END_USER_FLOW, position=5)
    EU_OPT_SATISFIED, _ = Option.objects.get_or_create(text='Yes', question=EU_SATISFACTION)
    EU_OPT_NOT_SATISFIED, _ = Option.objects.get_or_create(text='No', question=EU_SATISFACTION)
    END_USER_FLOW.end_nodes.append([EU_SATISFACTION.id, EU_OPT_SATISFIED.id])
    END_USER_FLOW.end_nodes.append([EU_SATISFACTION.id, EU_OPT_NOT_SATISFIED.id])
    END_USER_FLOW.save()

    EU_NOTGOODCOMMENT_FEEDBACK, _ = TextQuestion.objects.get_or_create(
            text='Feedback about Not good', label='notGoodComment',
            flow=END_USER_FLOW, position=5)

    EU_SATISFACTION_FEEDBACK, _ = TextQuestion.objects.get_or_create(
            text='Feedback about Satisfaction', label='feedbackAboutSatisfaction',
            flow=END_USER_FLOW, position=6)

    EU_DISSATISFACTION_FEEDBACK, _ = TextQuestion.objects.get_or_create(
            text='Feedback about Dissatisfaction', label='feedbackAboutDissatisfaction',
            flow=END_USER_FLOW, position=6)

    questions = {
        'WAS_PRODUCT_RECEIVED': WAS_PRODUCT_RECEIVED,
        'QUALITY_OF_PRODUCT': EU_QUALITY_OF_PRODUCT,
        'SATISFACTION_WITH_PRODUCT': EU_SATISFACTION,
        'AMOUNT_RECEIVED': EU_AMOUNT_RECEIVED,
        'DATE_RECEIVED': EU_DATE_RECEIVED,
        'INFORMED_OF_DELAY': EU_INFORMED_OF_DELAY,
        'REVISED_DELIVERY_DATE': EU_REVISED_DELIVERY_DATE,
        'NOT_GOOD_FEEDBACK': EU_NOTGOODCOMMENT_FEEDBACK,
        'SATISFACTION_FEEDBACK': EU_SATISFACTION_FEEDBACK,
        'DISSATISFACTION_FEEDBACK': EU_DISSATISFACTION_FEEDBACK
    }
    options = {
        'PRODUCT_WAS_RECEIVED': PRODUCT_WAS_RECEIVED,
        'PRODUCT_WAS_NOT_RECEIVED': PRODUCT_WAS_NOT_RECEIVED,
        'IN_GOOD_CONDITION': EU_OPT_GOOD,
        'DAMAGED': EU_OPT_DAMAGED,
        'SUB_STANDARD': EU_OPT_SUBSTANDARD,
        'EXPIRED': EU_OPT_EXPIRED,
        'INCOMPLETE': EU_OPT_INCOMPLETE,
        'OTHER': EU_OPT_OTHER,
        'SATISFIED': EU_OPT_SATISFIED,
        'NOT_SATISFIED': EU_OPT_NOT_SATISFIED,
        'WAS_INFORMED_OF_DELAY': eu_informed_of_delay_yes,
        'NOT_INFORMED_OF_DELAY': eu_informed_of_delay_no
    }
    return questions, options


seed_questions()
