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
            self.runnable.create_alert(issue)

    def _retrieve_negative_answer(self):
        for answer in self.answer_values:
            if answer["category"]["base"] == "No":
                return answer
        return None

