from eums.models import MultipleChoiceQuestion, Option, TextQuestion, NumericQuestion, Flow

middle_man_flow, _ = Flow.objects.get_or_create(label=Flow.Label.MIDDLE_MAN)

middle_man_flow.end_nodes = []

mm_question_1 = MultipleChoiceQuestion.objects.filter(label='productReceived', flow=middle_man_flow)
if mm_question_1.exists():
    mm_question_1.update(text='Was product received?', position=1)
else:
    mm_question_1 = MultipleChoiceQuestion.objects.create(
            text='Was product received?', label='productReceived', flow=middle_man_flow, position=1)
mm_q1_option_1 = Option.objects.filter(text='Yes', question=mm_question_1)
if mm_q1_option_1.count() < 0:
    mm_q1_option_1 = Option.objects.create(text='Yes', question=mm_question_1)
mm_q1_option_2 = Option.objects.filter(text='No', question=mm_question_1)
if mm_q1_option_2.count() < 0:
    mm_q1_option_2 = Option.objects.create(text='No', question=mm_question_1)

mm_question_2 = TextQuestion.objects.filter(label='dateOfReceipt', flow=middle_man_flow)
if mm_question_2.exists():
    mm_question_2.update(text='When was item received?', position=2)
else:
    mm_question_2 = TextQuestion.objects.create(
            text='When was item received?', label='dateOfReceipt', flow=middle_man_flow, position=2)

mm_question_3 = NumericQuestion.objects.filter(label='amountReceived', flow=middle_man_flow)
if mm_question_3.exists():
    mm_question_3.update(text='What is the amount received?', position=3)
else:
    mm_question_3 = NumericQuestion.objects.create(
            text='What is the amount received?', label='amountReceived', flow=middle_man_flow, position=3)
middle_man_flow.end_nodes.append([mm_question_3.id, Flow.NO_OPTION])

mm_question_4 = MultipleChoiceQuestion.objects.filter(label='informedOfDelay', flow=middle_man_flow)
if mm_question_4.exists():
    mm_question_4.update(text='Were you informed of the delay?', position=2)
else:
    mm_question_4 = MultipleChoiceQuestion.objects.create(
            text='Were you informed of the delay?', label='informedOfDelay', flow=middle_man_flow, position=2)
mm_q4_option_1 = Option.objects.filter(text='Yes', question=mm_question_4)
if mm_q4_option_1.count() < 1:
    mm_q4_option_1 = Option.objects.create(text='Yes', question=mm_question_4)
mm_q4_option_2 = Option.objects.filter(text='No', question=mm_question_4)
if mm_q4_option_2.count() < 1:
    mm_q4_option_2 = Option.objects.create(text='No', question=mm_question_4)
middle_man_flow.end_nodes.append([mm_question_4.id, mm_q4_option_2.id])

mm_question_5 = TextQuestion.objects.filter(label='revisedDeliveryDate', flow=middle_man_flow)
if mm_question_5.exists():
    mm_question_5.update(text='When to expect delay?', position=3)
else:
    mm_question_5 = TextQuestion.objects.create(
            text='When to expect delay?', label='revisedDeliveryDate', flow=middle_man_flow, position=3)
middle_man_flow.end_nodes.append([mm_question_5.id, Flow.NO_OPTION])

mm_question_6 = TextQuestion.objects.filter(label='additionalComments', flow=middle_man_flow)
if mm_question_6.exists():
    mm_question_6.update(text='Additional Remarks', position=4)
else:
    mm_question_6 = TextQuestion.objects.create(
            text='Additional Remarks', label='additionalComments', flow=middle_man_flow, position=4)

middle_man_flow.save()
