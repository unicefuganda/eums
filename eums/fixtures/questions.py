from eums.fixtures.end_user_questions import *
from eums.fixtures.ip_questions import *
from eums.fixtures.web_questions import *
from eums.fixtures.middle_man_questions import *


def seed_questions_and_flows():
    return {
        'END_USER_FLOW': END_USER_FLOW,
        'MIDDLE_MAN_FLOW': middle_man_flow,
        'IP_FLOW': ip_flow,
        'WEB_FLOW': web_flow
    }
