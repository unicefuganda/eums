from eums.models import Alert, Question
from eums.utils import snakify


class ResponseAlertHandler(object):

    ALERT_TYPES = {
        Question.LABEL.deliveryReceived: Alert.ISSUE_TYPES.not_received,
        Question.LABEL.itemReceived: Alert.ISSUE_TYPES.not_received,
        Question.LABEL.isDeliveryInGoodOrder: Alert.ISSUE_TYPES.bad_condition,
        Question.LABEL.satisfiedWithDelivery: Alert.ISSUE_TYPES.not_satisfied
    }

    # TODO: enrich answer instead of a dictionary
    def __init__(self, runnable, answer_values):
        self.runnable = runnable
        self.answer_values = answer_values

    def process(self):
        issue = self._identify_issue()
        if issue:
            self.runnable.create_alert(snakify(issue))

    def _identify_issue(self):
        for answer in self.answer_values:
            if self._is_generally_unacceptable(answer):
                return self.ALERT_TYPES[answer["label"]]
            if self._is_quality_unacceptable(answer):
                return answer["category"]["base"]
        return None

    def _is_generally_unacceptable(self, answer):
        return answer.get("label") in self.ALERT_TYPES and answer["category"]["base"] == "No"

    def _is_quality_unacceptable(self, answer):
        return answer.get("label") == Question.LABEL.qualityOfProduct and not answer["category"]["base"] == "Good"

