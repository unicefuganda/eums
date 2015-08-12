from eums.fixtures.end_user_questions import *
from eums.fixtures.ip_questions import *
from eums.fixtures.web_questions import *


def seed_questions_and_flows():
    middle_man_flow, _ = Flow.objects.get_or_create(rapid_pro_id=2662, for_runnable_type=Runnable.MIDDLE_MAN)

    return {'END_USER_FLOW': end_user_flow, 'MIDDLE_MAN_FLOW': middle_man_flow, 'IP_FLOW': ip_flow, 'WEB_FLOW': web_flow}
