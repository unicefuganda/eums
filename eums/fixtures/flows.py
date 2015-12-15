from eums.models import Flow


def seed_flows():
    Flow.objects.all().delete()
    end_user_flow, _ = Flow.objects.get_or_create(label=Flow.Label.END_USER)
    middle_man_flow, _ = Flow.objects.get_or_create(label=Flow.Label.MIDDLE_MAN)
    ip_flow, _ = Flow.objects.get_or_create(label=Flow.Label.IMPLEMENTING_PARTNER)
    web_flow, _ = Flow.objects.get_or_create(label=Flow.Label.WEB)
    return {'END_USER_FLOW': end_user_flow, 'MIDDLE_MAN_FLOW': middle_man_flow, 'IP_FLOW': ip_flow,
            'WEB_FLOW': web_flow}
