from eums.models import Question, Flow, TextAnswer, TextQuestion
from django.db.models import Q


def change_remark_label_for_end_user():
    end_user_flow = Flow.objects.filter(label=Flow.Label.END_USER)
    satisfaction_question = Question.objects.filter(label='feedbackAboutSatisfaction', flow=end_user_flow)
    if satisfaction_question.exists():
        satisfaction_question.update(label=Question.LABEL.additionalDeliveryComments)
    else:
        Question.build_question(TextQuestion, text='Additional Remarks',
                                label=Question.LABEL.additionalDeliveryComments,
                                flow=end_user_flow, position=6)


def move_remark_answer():
    end_user_flow = Flow.objects.filter(label=Flow.Label.END_USER)
    questions = Question.objects.filter((Q(label='notGoodComment') | Q(label='feedbackAboutDissatisfaction')),
                                        flow=end_user_flow)
    if questions.exists():
        additional_remark_question = Question.objects.filter(label=Question.LABEL.additionalDeliveryComments,
                                                             flow=end_user_flow)
        for question in questions:
            answers = TextAnswer.objects.filter(question=question)
            answers.update(question=additional_remark_question.first())


def remove_useless_question():
    end_user_flow = Flow.objects.filter(label=Flow.Label.END_USER)
    questions = Question.objects.filter((Q(label='notGoodComment') | Q(label='feedbackAboutDissatisfaction')),
                                        flow=end_user_flow)
    questions.delete()


def change_remark_label_for_middleman():
    middleman = Flow.objects.filter(label=Flow.Label.MIDDLE_MAN)
    additional_remarks = Question.objects.filter(label='additionalComments', flow=middleman)
    if additional_remarks.exists():
        additional_remarks.update(label=Question.LABEL.additionalDeliveryComments)
    else:
        Question.build_question(TextQuestion, text='Additional Remarks',
                                label=Question.LABEL.additionalDeliveryComments,
                                flow=middleman, position=4)


change_remark_label_for_middleman()
change_remark_label_for_end_user()
move_remark_answer()
remove_useless_question()

