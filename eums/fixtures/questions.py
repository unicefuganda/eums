from eums.fixtures.end_user_questions import setup_end_user_flow_questions
from eums.fixtures.flows import seed_flows
from eums.fixtures.ip_questions import setup_ip_flow_questions
from eums.fixtures.web_questions import setup_web_flow_questions


def seed_questions_and_flows():
    flows = seed_flows()
    end_user_flow = flows['END_USER_FLOW']
    ip_flow = flows['IP_FLOW']
    web_flow = flows['WEB_FLOW']

    setup_end_user_flow_questions(end_user_flow)

    setup_ip_flow_questions(ip_flow)

    setup_web_flow_questions(web_flow)

    return flows
