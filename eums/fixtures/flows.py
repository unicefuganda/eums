from eums.models import Flow, Runnable


def seed_flows():
    Flow.objects.all().delete()
    Flow.objects.get_or_create(rapid_pro_id=2436, for_runnable_type=Runnable.END_USER)
    Flow.objects.get_or_create(rapid_pro_id=2662, for_runnable_type=Runnable.MIDDLE_MAN)
    Flow.objects.get_or_create(rapid_pro_id=16995, for_runnable_type=Runnable.IMPLEMENTING_PARTNER)
