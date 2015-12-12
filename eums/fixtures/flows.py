from eums.models import Flow, Runnable

def seed_flows():
    Flow.objects.all().delete()
    end_user_flow, _ = Flow.objects.get_or_create(rapid_pro_id=2436, label=Flow.Label.END_USER)
    middle_man_flow, _ = Flow.objects.get_or_create(rapid_pro_id=2662, label=Flow.Label.MIDDLE_MAN)
    ip_flow, _ = Flow.objects.get_or_create(rapid_pro_id=16995, label=Flow.Label.IMPLEMENTING_PARTNER)
    web_flow, _ = Flow.objects.get_or_create(rapid_pro_id=0, label=Flow.Label.WEB)
    return {'END_USER_FLOW': end_user_flow, 'MIDDLE_MAN_FLOW': middle_man_flow, 'IP_FLOW': ip_flow, 'WEB_FLOW': web_flow}
