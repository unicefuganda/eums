from eums.models import MultipleChoiceQuestion, Option, TextQuestion, Flow, Runnable, Question

ip_flow, _ = Flow.objects.get_or_create(rapid_pro_id=16995, for_runnable_type=Runnable.IMPLEMENTING_PARTNER)

ip_question_1, _ = MultipleChoiceQuestion.objects.get_or_create(
    uuids=['3ce26959-1e21-4cf6-98a1-c460b57e7ba5', '31e426cd-6934-4252-869f-4e1843691d4a'],
    text='Was delivery received?', label=Question.LABEL.deliveryReceived, flow=ip_flow, position=1)
Option.objects.get_or_create(text='Yes', question=ip_question_1)
no_delivery, _ = Option.objects.get_or_create(text='No', question=ip_question_1)
ip_flow.end_nodes = []
ip_flow.end_nodes.append([ip_question_1.id, no_delivery.id])
ip_flow.save()

ip_question_2, _ = TextQuestion.objects.get_or_create(
    uuids=['0f49db8d-432e-4d18-b596-408a0bb2eaa8'],
    text='When was delivery received?', label='dateOfReceipt', flow=ip_flow, position=2)

ip_question_3, _ = MultipleChoiceQuestion.objects.get_or_create(
    uuids=['3762e25b-20e2-49fd-ad4f-0ccec08b4426'],
    text='Was delivery in good order?', label=Question.LABEL.isDeliveryInGoodOrder,
    flow=ip_flow, position=3)
Option.objects.get_or_create(text='Yes', question=ip_question_3)
Option.objects.get_or_create(text='No', question=ip_question_3)

ip_question_4, _ = MultipleChoiceQuestion.objects.get_or_create(
    text="Are you satisfied with the product?",
    label="satisfiedWithProduct",
    flow=ip_flow, position=4,
    uuids=['7a5c8f57-5c3f-4659-b717-0de556898157', 'dc27480e-4931-46a8-9bea-ad0dadbec1d8'])
Option.objects.get_or_create(text="No", question=ip_question_4)
Option.objects.get_or_create(text="Yes", question=ip_question_4)

ip_question_5, _ = TextQuestion.objects.get_or_create(
    uuids=['2fccd250-00a1-4740-b30e-3593b8f147a1'],
    text='Additional Remarks', label='additionalDeliveryComments', flow=ip_flow, position=5)
ip_flow.end_nodes.append([ip_question_5.id, Flow.NO_OPTION])
ip_flow.save()
