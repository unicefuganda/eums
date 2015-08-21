from eums.models import Alert
from eums.test.factories.user_factory import UserFactory


class ResponseAlertHandler(object):

    def __init__(self, runnable, answer_values):
        self.runnable = runnable
        self.answer_values = answer_values

    def process(self):
        delivery_received_answer = (answer for answer in self.answer_values if answer["label"] == "deliveryReceived").next()
        delivery_in_good_order_answer = (answer for answer in self.answer_values if answer["label"] == "isDeliveryInGoodOrder").next()

        issue = None
        if delivery_received_answer["category"]["base"] == "No":
            issue = Alert.ISSUE_TYPES.not_received
        elif delivery_in_good_order_answer["category"]["base"] == "No":
            issue = Alert.ISSUE_TYPES.bad_condition

        if issue:
            order_type = Alert.ORDER_TYPES.purchase_order
            order_number = self.runnable.distributionplannode_set.first().item.number()
            consignee_name = self.runnable.consignee.name
            contact_name = 'Misaina Naval Andrianjafinandrasana'
            delivery_sender = UserFactory(first_name='UNICEF', last_name='Official')

            Alert.objects.create(
                order_type=order_type,
                order_number=order_number,
                consignee_name=consignee_name,
                contact_name=contact_name,
                issue=issue,
                delivery_sender=delivery_sender,
                runnable=self.runnable)