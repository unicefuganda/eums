from eums.models import MultipleChoiceQuestion, Option, TextQuestion, Flow, Question


def seed_ip_questions():
    ip_flow, _ = Flow.objects.get_or_create(label=Flow.Label.IMPLEMENTING_PARTNER)
    ip_flow.temp_end_nodes = []
    ip_flow.final_end_nodes = []
    ip_flow.optional_end_nodes = []

    ip_question_1 = Question.build_question(MultipleChoiceQuestion, text='Was delivery received?',
                                            label=Question.LABEL.deliveryReceived, flow=ip_flow, position=1)
    ip_yes = Option.build_option(text='Yes', question=ip_question_1)
    ip_no = Option.build_option(text='No', question=ip_question_1)
    ip_flow.final_end_nodes.append([ip_question_1.id, ip_no.id])
    ip_flow.save()

    ip_question_2 = Question.build_question(TextQuestion, text='When was delivery received?',
                                            label=Question.LABEL.dateOfReceipt, flow=ip_flow, position=2)

    ip_question_3 = Question.build_question(MultipleChoiceQuestion, text='Was delivery in good condition?',
                                            label=Question.LABEL.isDeliveryInGoodOrder, flow=ip_flow, position=3)
    in_good_condition_yes = Option.build_option(text='Yes', question=ip_question_3)
    in_good_condition_no = Option.build_option(text='No', question=ip_question_3)

    ip_question_4 = Question.build_question(MultipleChoiceQuestion, text="Are you satisfied with the delivery?",
                                            label=Question.LABEL.satisfiedWithDelivery, flow=ip_flow, position=4)
    satisfied = Option.build_option(text="Yes", question=ip_question_4)
    not_satisfied = Option.build_option(text="No", question=ip_question_4)
    ip_flow.temp_end_nodes.append([ip_question_4.id, satisfied.id])
    ip_flow.temp_end_nodes.append([ip_question_4.id, not_satisfied.id])
    ip_flow.save()

    ip_question_5 = Question.build_question(TextQuestion, text='Additional Remarks',
                                            label=Question.LABEL.additionalDeliveryComments, flow=ip_flow, position=5)

    ip_flow.optional_end_nodes.append([ip_question_5.id, Flow.NO_OPTION])
    ip_flow.save()

    questions = {
        'WAS_DELIVERY_RECEIVED': ip_question_1,
        'DATE_OF_RECEIPT': ip_question_2,
        'IS_DELIVERY_IN_GOOD_ORDER': ip_question_3,
        'SATISFIED_WITH_DELIVERY': ip_question_4,
        'ADDITIONAL_DELIVERY_COMMENTS': ip_question_5
    }

    options = {
        'DELIVERY_WAS_RECEIVED': ip_yes,
        'DELIVERY_WAS_NOT_RECEIVED': ip_no,
        'IN_GOOD_CONDITION': in_good_condition_yes,
        'NOT_IN_GOOD_CONDITION': in_good_condition_no,
        'SATISFIED': satisfied,
        'NOT_SATISFIED': not_satisfied
    }

    return questions, options, ip_flow


ip_questions, ip_options, ip_flow = seed_ip_questions()
