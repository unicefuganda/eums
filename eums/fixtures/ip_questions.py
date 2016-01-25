from eums.models import MultipleChoiceQuestion, Option, TextQuestion, Flow, Question


def seed_ip_questions():
    ip_flow, _ = Flow.objects.get_or_create(label=Flow.Label.IMPLEMENTING_PARTNER)
    ip_flow.end_nodes = []

    ip_question_1 = Question.build_question(MultipleChoiceQuestion, text='Was delivery received?',
                                            label=Question.LABEL.deliveryReceived, flow=ip_flow, position=1)
    # ip_question_1 = MultipleChoiceQuestion.objects.filter(label=Question.LABEL.deliveryReceived, flow=ip_flow)
    # if ip_question_1.exists():
    #     ip_question_1.update(text='Was delivery received?', position=1)
    # else:
    #     ip_question_1 = MultipleChoiceQuestion.objects.create(
    #             text='Was delivery received?', label=Question.LABEL.deliveryReceived, flow=ip_flow, position=1)
    ip_yes = Option.build_option(text='Yes', question=ip_question_1)
    # ip_yes = Option.objects.filter(text='Yes', question=ip_question_1)
    # if ip_yes.count() < 1:
    #     ip_yes = Option.objects.create(text='Yes', question=ip_question_1)
    ip_no = Option.objects.filter(text='No', question=ip_question_1)
    if ip_no.count() < 1:
        ip_no = Option.objects.create(text='No', question=ip_question_1)
    ip_flow.end_nodes.append([ip_question_1.id, ip_no.id])
    ip_flow.save()

    ip_question_2 = TextQuestion.objects.filter(label=Question.LABEL.dateOfReceipt, flow=ip_flow)
    if ip_question_2.exists():
        ip_question_2.update(text='When was delivery received?', position=2)
    else:
        ip_question_2 = TextQuestion.objects.create(
                text='When was delivery received?', label=Question.LABEL.dateOfReceipt, flow=ip_flow, position=2)

    ip_question_3 = MultipleChoiceQuestion.objects.filter(label=Question.LABEL.isDeliveryInGoodOrder, flow=ip_flow)
    if ip_question_3.exists():
        ip_question_3.update(text='Was delivery in good condition?', position=3)
    else:
        ip_question_3 = MultipleChoiceQuestion.objects.create(
                text='Was delivery in good condition?', label=Question.LABEL.isDeliveryInGoodOrder,
                flow=ip_flow, position=3)
    in_good_condition_yes = Option.objects.filter(text='Yes', question=ip_question_3)
    if in_good_condition_yes.count() < 1:
        in_good_condition_yes = Option.objects.create(text='Yes', question=ip_question_3)
    in_good_condition_no = Option.objects.filter(text='No', question=ip_question_3)
    if in_good_condition_no.count() < 1:
        in_good_condition_no = Option.objects.create(text='No', question=ip_question_3)

    ip_question_4 = MultipleChoiceQuestion.objects.filter(label=Question.LABEL.satisfiedWithDelivery, flow=ip_flow)
    if ip_question_4.exists():
        ip_question_4.update(text="Are you satisfied with the delivery?", position=4)
    else:
        ip_question_4 = MultipleChoiceQuestion.objects.create(
                text="Are you satisfied with the delivery?", label=Question.LABEL.satisfiedWithDelivery,
                flow=ip_flow, position=4)
    satisfied = Option.objects.filter(text="Yes", question=ip_question_4)
    if satisfied.count() < 1:
        satisfied = Option.objects.create(text="Yes", question=ip_question_4)
    not_satisfied = Option.objects.filter(text="No", question=ip_question_4)
    if not_satisfied.count() < 1:
        not_satisfied = Option.objects.create(text="No", question=ip_question_4)
    ip_flow.end_nodes.append([ip_question_4.id, satisfied.id])
    ip_flow.end_nodes.append([ip_question_4.id, not_satisfied.id])
    ip_flow.save()

    ip_question_5 = TextQuestion.objects.filter(label=Question.LABEL.additionalDeliveryComments, flow=ip_flow)
    if ip_question_5.exists():
        ip_question_5.update(text='Additional Remarks', position=5)
    else:
        ip_question_5 = TextQuestion.objects.create(
                text='Additional Remarks', label=Question.LABEL.additionalDeliveryComments, flow=ip_flow, position=5)

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
