from unittest import TestCase
from eums.models import Alert
from eums.test.factories.alert_factory import AlertFactory


class AlertTest(TestCase):

    def test_should_provide_display_name_for_issue_type_of_not_received(self):
        alert = AlertFactory(issue=Alert.ISSUE_TYPES.not_received)
        self.assertEqual(alert.issue_display_name(), Alert.ISSUE_TYPES[alert.issue])

    def test_should_provide_display_name_for_issue_type_of_bad_condition(self):
        alert = AlertFactory(issue=Alert.ISSUE_TYPES.bad_condition)
        self.assertEqual(alert.issue_display_name(), Alert.ISSUE_TYPES[alert.issue])