from eums.models import Flow, Runnable


def seed_flows():
    Flow.objects.get_or_create(rapid_pro_id=2436, for_runnable_type=Runnable.END_USER)
    Flow.objects.get_or_create(rapid_pro_id=2662, for_runnable_type=Runnable.MIDDLE_MAN)