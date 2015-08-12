from eums.fixtures.end_user_questions import *
from eums.fixtures.flows import seed_flows
from eums.fixtures.ip_questions import *
from eums.fixtures.web_questions import *


def seed_questions_and_flows():
    flows = seed_flows()

    return {'END_USER_FLOW': end_user_flow, 'MIDDLE_MAN_FLOW': flows['MIDDLE_MAN_FLOW'], 'IP_FLOW': ip_flow, 'WEB_FLOW': web_flow}
