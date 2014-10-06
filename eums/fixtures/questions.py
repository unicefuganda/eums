from eums.models import Option
from eums.models.question import Question

question_1, _ = Question.objects.get_or_create(
    uuids='2ff9fab3-4c12-400e-a2fe-4551fa1ebc18', text='Was item received?',
    type=Question.MULTIPLE_CHOICE, label='productReceived')

Option.objects.get_or_create(text='Yes', question=question_1)
Option.objects.get_or_create(text='No', question=question_1)

Question.objects.get_or_create(
    uuids='abc9c005-7a7c-44f8-b946-e970a361b6cf', text='What date was it received?',
    type=Question.TEXT, label='dateOfReceipt')

Question.objects.get_or_create(
    uuids='6c1cf92d-59b8-4bd3-815b-783abd3dfad9', text='How much was received?',
    type=Question.NUMERIC, label='amountReceived')

question_2, _ = Question.objects.get_or_create(
    uuids='7a5c8f57-5c3f-4659-b717-0de556898157, dc27480e-4931-46a8-9bea-ad0dadbec1d8',
    text='Are you satisfied with the delivery?', type=Question.MULTIPLE_CHOICE,
    label='satisfactionWithDelivery'
)
Option.objects.get_or_create(text='Yes', question=question_2)
Option.objects.get_or_create(text='No', question=question_2)

question_3, _ = Question.objects.get_or_create(
    uuids='fe368546-1b9c-4a15-926d-68b7caaa0380',
    text='What is the condition of the items delivered?', type=Question.MULTIPLE_CHOICE,
    label='deliveryCondition'
)
Option.objects.get_or_create(text='Expired', question=question_3)
Option.objects.get_or_create(text='Damaged', question=question_3)
Option.objects.get_or_create(text='Late', question=question_3)
Option.objects.get_or_create(text='Substandard', question=question_3)