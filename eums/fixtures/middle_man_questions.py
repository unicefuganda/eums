from eums.models import MultipleChoiceQuestion, Option, TextQuestion, NumericQuestion, Flow, Runnable

middle_man_flow, _ = Flow.objects.get_or_create(rapid_pro_id=2662, for_runnable_type=Runnable.MIDDLE_MAN)

middle_man_flow.end_nodes = []

mm_question_1, _ = MultipleChoiceQuestion.objects.get_or_create(
    uuids=['53a31c08-896e-43b2-bd1f-e5a527d389b9', 'b8189435-a6b5-42a0-b5b0-91c95484dae1'],
    text='Was product received?', label='productReceived', flow=middle_man_flow, position=1)
mm_q1_option_1, _ = Option.objects.get_or_create(text='Yes', question=mm_question_1)
mm_q1_option_2, _ = Option.objects.get_or_create(text='No', question=mm_question_1)

mm_question_2, _ = TextQuestion.objects.get_or_create(
    uuids=['884ed6d8-1cef-4878-999d-bce7de85e27c'],
    text='When was item received?', label='dateOfReceipt', flow=middle_man_flow, position=2)

mm_question_3, _ = NumericQuestion.objects.get_or_create(
    uuids=['9af2907a-d3a6-41ee-8a12-0b3197d30baf'],
    text='What is the amount received?', label='amountReceived', flow=middle_man_flow, position=3)

middle_man_flow.end_nodes.append([mm_question_3.id, Flow.NO_OPTION])

mm_question_4, _ = MultipleChoiceQuestion.objects.get_or_create(
    uuids=['4e46a52d-8ea1-4bc4-824c-f8da74ce7ad0', '269aa1f7-7ca5-46f6-9bc0-6ad3fb7a5629'],
    text='Were you informed of the delay?', label='informedOfDelay', flow=middle_man_flow, position=2)
mm_q4_option_1, _ = Option.objects.get_or_create(text='Yes', question=mm_question_4)
mm_q4_option_2, _ = Option.objects.get_or_create(text='No', question=mm_question_4)

middle_man_flow.end_nodes.append([mm_question_4.id, mm_q4_option_2.id])

mm_question_5, _ = TextQuestion.objects.get_or_create(
    uuids=['3f5d290a-067d-4cb9-bb09-ed7c424a6abd'],
    text='When to expect delay?', label='revisedDeliveryDate', flow=middle_man_flow, position=3)

middle_man_flow.end_nodes.append([mm_question_5.id, Flow.NO_OPTION])
middle_man_flow.save()
