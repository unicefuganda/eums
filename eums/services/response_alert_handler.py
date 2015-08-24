from eums.models import Alert, Question


class ResponseAlertHandler(object):

    ALERT_TYPES = {
        Question.LABEL.deliveryReceived: Alert.ISSUE_TYPES.not_received,
        Question.LABEL.isDeliveryInGoodOrder: Alert.ISSUE_TYPES.bad_condition
    }

    def __init__(self, runnable, answer_values):
        self.runnable = runnable
        self.answer_values = answer_values

    def process(self):
        negative_answer = self._retrieve_negative_answer()

        if negative_answer:

            issue = self.ALERT_TYPES[negative_answer["label"]]
            order_type = Alert.ORDER_TYPES.purchase_order
            order_number = self.runnable.distributionplannode_set.first().item.number()
            consignee_name = self.runnable.consignee.name
            contact = self.runnable.build_contact()
            contact_name = "%s %s" % (contact.get('firstName', ''), contact.get('lastName', ''))

            Alert.objects.create(
                order_type=order_type,
                order_number=order_number,
                consignee_name=consignee_name,
                contact_name=contact_name,
                issue=issue,
                runnable=self.runnable)

    def _retrieve_negative_answer(self):
        for answer in self.answer_values:
            if answer["category"]["base"] == "No":
                return answer
        return None

