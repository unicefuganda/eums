from eums.models import MultipleChoiceQuestion, Option, TextQuestion, NumericQuestion, Flow, Question

WAS_PRODUCT_RECEIVED = None
PRODUCT_WAS_RECEIVED = None
PRODUCT_WAS_NOT_RECEIVED = None
EU_DATE_RECEIVED = None
EU_AMOUNT_RECEIVED = None
EU_QUALITY_OF_PRODUCT = None
EU_SATISFACTION = None
EU_INFORMED_OF_DELAY = None
EU_REVISED_DELIVERY_DATE = None
EU_OPT_DAMAGED = None
EU_OPT_GOOD = None
EU_OPT_SATISFIED = None
EU_OPT_NOT_SATISFIED = None
EU_OPT_EXPIRED = None
EU_ADDITIONAL_REMARK = None
END_USER_FLOW = None


def seed_questions():
    global WAS_PRODUCT_RECEIVED, PRODUCT_WAS_RECEIVED, PRODUCT_WAS_NOT_RECEIVED, EU_DATE_RECEIVED, EU_AMOUNT_RECEIVED
    global EU_QUALITY_OF_PRODUCT, EU_SATISFACTION, EU_INFORMED_OF_DELAY, EU_REVISED_DELIVERY_DATE, EU_OPT_EXPIRED
    global EU_OPT_DAMAGED, EU_OPT_GOOD, EU_OPT_SATISFIED, EU_OPT_NOT_SATISFIED
    global EU_ADDITIONAL_REMARK
    global END_USER_FLOW

    END_USER_FLOW, _ = Flow.objects.get_or_create(label=Flow.Label.END_USER)
    END_USER_FLOW.end_nodes = []

    WAS_PRODUCT_RECEIVED = Question.build_question(MultipleChoiceQuestion, text='Was product received?',
                                                   label='productReceived', flow=END_USER_FLOW, position=1)
    PRODUCT_WAS_RECEIVED = Option.build_option(text='Yes', question=WAS_PRODUCT_RECEIVED)
    PRODUCT_WAS_NOT_RECEIVED = Option.build_option(text='No', question=WAS_PRODUCT_RECEIVED)

    EU_DATE_RECEIVED = Question.build_question(TextQuestion, text='What date was it received?', label='dateOfReceipt',
                                               flow=END_USER_FLOW, position=2)

    EU_INFORMED_OF_DELAY = Question.build_question(MultipleChoiceQuestion, text='Have you been informed of the delay?',
                                                   label='informedOfDelay', flow=END_USER_FLOW, position=2)
    eu_informed_of_delay_yes = Option.build_option(text='Yes', question=EU_INFORMED_OF_DELAY)
    eu_informed_of_delay_no = Option.build_option(text='No', question=EU_INFORMED_OF_DELAY)
    END_USER_FLOW.end_nodes.append([EU_INFORMED_OF_DELAY.id, eu_informed_of_delay_no.id])
    END_USER_FLOW.save()

    EU_AMOUNT_RECEIVED = Question.build_question(NumericQuestion, text='How much was received?',
                                                 label='amountReceived', flow=END_USER_FLOW, position=3)

    EU_REVISED_DELIVERY_DATE = Question.build_question(TextQuestion,
                                                       text='What did the partner say is the revised delivery date?',
                                                       label='revisedDeliveryDate', flow=END_USER_FLOW, position=3)
    END_USER_FLOW.end_nodes.append([EU_REVISED_DELIVERY_DATE.id, Flow.NO_OPTION])
    END_USER_FLOW.save()

    EU_QUALITY_OF_PRODUCT = Question.build_question(MultipleChoiceQuestion, text='What is the quality of the product?',
                                                    label='qualityOfProduct', flow=END_USER_FLOW, position=4)
    EU_OPT_GOOD = Option.build_option(text='Good', question=EU_QUALITY_OF_PRODUCT)
    EU_OPT_DAMAGED = Option.build_option(text='Damaged', question=EU_QUALITY_OF_PRODUCT)
    EU_OPT_SUBSTANDARD = Option.build_option(text='Substandard', question=EU_QUALITY_OF_PRODUCT)
    EU_OPT_EXPIRED = Option.build_option(text='Expired', question=EU_QUALITY_OF_PRODUCT)
    EU_OPT_INCOMPLETE = Option.build_option(text='Incomplete', question=EU_QUALITY_OF_PRODUCT)
    EU_OPT_OTHER = Option.build_option(text='Other', question=EU_QUALITY_OF_PRODUCT)
    END_USER_FLOW.end_nodes.append([EU_QUALITY_OF_PRODUCT.id, EU_OPT_DAMAGED.id])
    END_USER_FLOW.end_nodes.append([EU_QUALITY_OF_PRODUCT.id, EU_OPT_SUBSTANDARD.id])
    END_USER_FLOW.end_nodes.append([EU_QUALITY_OF_PRODUCT.id, EU_OPT_EXPIRED.id])
    END_USER_FLOW.end_nodes.append([EU_QUALITY_OF_PRODUCT.id, EU_OPT_INCOMPLETE.id])
    END_USER_FLOW.end_nodes.append([EU_QUALITY_OF_PRODUCT.id, EU_OPT_OTHER.id])
    END_USER_FLOW.save()

    EU_SATISFACTION = Question.build_question(MultipleChoiceQuestion, text='Are you satisfied with the product?',
                                              label='satisfiedWithProduct', flow=END_USER_FLOW, position=5)
    EU_OPT_SATISFIED = Option.build_option(text='Yes', question=EU_SATISFACTION)
    EU_OPT_NOT_SATISFIED = Option.build_option(text='No', question=EU_SATISFACTION)
    END_USER_FLOW.end_nodes.append([EU_SATISFACTION.id, EU_OPT_SATISFIED.id])
    END_USER_FLOW.end_nodes.append([EU_SATISFACTION.id, EU_OPT_NOT_SATISFIED.id])
    END_USER_FLOW.save()

    EU_ADDITIONAL_REMARK = Question.build_question(TextQuestion, text='Additional Remarks',
                                                   label=Question.LABEL.additionalDeliveryComments,
                                                   flow=END_USER_FLOW, position=6)

    questions = {
        'WAS_PRODUCT_RECEIVED': WAS_PRODUCT_RECEIVED,
        'QUALITY_OF_PRODUCT': EU_QUALITY_OF_PRODUCT,
        'SATISFACTION_WITH_PRODUCT': EU_SATISFACTION,
        'AMOUNT_RECEIVED': EU_AMOUNT_RECEIVED,
        'DATE_RECEIVED': EU_DATE_RECEIVED,
        'INFORMED_OF_DELAY': EU_INFORMED_OF_DELAY,
        'REVISED_DELIVERY_DATE': EU_REVISED_DELIVERY_DATE,
        'ADDITIONAL_REMARK': EU_ADDITIONAL_REMARK
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
