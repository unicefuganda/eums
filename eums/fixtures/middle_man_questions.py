from eums.models import MultipleChoiceQuestion, Option, TextQuestion, NumericQuestion, Flow, Runnable

middle_man_flow, _ = Flow.objects.get_or_create(label=Flow.Label.MIDDLE_MAN)

middle_man_flow.end_nodes = []

mm_question_1, _ = MultipleChoiceQuestion.objects.get_or_create(
    text='Was product received?', label='productReceived', flow=middle_man_flow, position=1)
mm_q1_option_1, _ = Option.objects.get_or_create(text='Yes', question=mm_question_1)
mm_q1_option_2, _ = Option.objects.get_or_create(text='No', question=mm_question_1)

mm_question_2, _ = TextQuestion.objects.get_or_create(
    text='When was item received?', label='dateOfReceipt', flow=middle_man_flow, position=2)

mm_question_3, _ = NumericQuestion.objects.get_or_create(
    text='What is the amount received?', label='amountReceived', flow=middle_man_flow, position=3)

middle_man_flow.end_nodes.append([mm_question_3.id, Flow.NO_OPTION])

mm_question_4, _ = MultipleChoiceQuestion.objects.get_or_create(
    text='Were you informed of the delay?', label='informedOfDelay', flow=middle_man_flow, position=2)
mm_q4_option_1, _ = Option.objects.get_or_create(text='Yes', question=mm_question_4)
mm_q4_option_2, _ = Option.objects.get_or_create(text='No', question=mm_question_4)

middle_man_flow.end_nodes.append([mm_question_4.id, mm_q4_option_2.id])

mm_question_5, _ = TextQuestion.objects.get_or_create(
    text='When to expect delay?', label='revisedDeliveryDate', flow=middle_man_flow, position=3)

middle_man_flow.end_nodes.append([mm_question_5.id, Flow.NO_OPTION])
middle_man_flow.save()
