from eums.models import MultipleChoiceQuestion, Option, TextQuestion, NumericQuestion, Flow, Question

middle_man_flow, _ = Flow.objects.get_or_create(label=Flow.Label.MIDDLE_MAN)

middle_man_flow.end_nodes = []

mm_question_1 = Question.build_question(MultipleChoiceQuestion, text='Was product received?', label='productReceived',
                                        flow=middle_man_flow, position=1)
mm_q1_option_1 = Option.build_option(text='Yes', question=mm_question_1)
mm_q1_option_2 = Option.build_option(text='No', question=mm_question_1)

mm_question_2 = Question.build_question(TextQuestion, text='When was item received?', label='dateOfReceipt',
                                        flow=middle_man_flow, position=2)

mm_question_3 = Question.build_question(NumericQuestion, text='What is the amount received?', label='amountReceived',
                                        flow=middle_man_flow, position=3)
middle_man_flow.end_nodes.append([mm_question_3.id, Flow.NO_OPTION])

mm_question_4 = Question.build_question(MultipleChoiceQuestion, text='Were you informed of the delay?',
                                        label='informedOfDelay', flow=middle_man_flow, position=2)
mm_q4_option_1 = Option.build_option(text='Yes', question=mm_question_4)
mm_q4_option_2 = Option.build_option(text='No', question=mm_question_4)
middle_man_flow.end_nodes.append([mm_question_4.id, mm_q4_option_2.id])

mm_question_5 = Question.build_question(TextQuestion, text='When to expect delay?', label='revisedDeliveryDate',
                                        flow=middle_man_flow, position=3)
middle_man_flow.end_nodes.append([mm_question_5.id, Flow.NO_OPTION])

mm_question_6 = Question.build_question(TextQuestion, text='Additional Remarks',
                                        label=Question.LABEL.additionalDeliveryComments,
                                        flow=middle_man_flow, position=4)

middle_man_flow.save()
