from eums.models import Alert, Question


class ResponseAlertHandler(object):

    def __init__(self, runnable, answer_values):
        self.runnable = runnable
        self.answer_values = answer_values

    def process(self):
        delivery_received_answer = self._retrieve_answer_for(Question.LABEL.deliveryReceived)
        delivery_in_good_order_answer = self._retrieve_answer_for(Question.LABEL.isDeliveryInGoodOrder)

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

            Alert.objects.create(
                order_type=order_type,
                order_number=order_number,
                consignee_name=consignee_name,
                contact_name=contact_name,
                issue=issue,
                runnable=self.runnable)

    def _retrieve_answer_for(self, label):
        return (answer for answer in self.answer_values if answer["label"] == label).next()