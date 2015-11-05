from eums.models import UserProfile, Flow, Runnable, Question, DistributionPlanNode as DeliveryNode, \
    DistributionPlan as Delivery


class StatsSearchData:
    def __init__(self):
        self.nodes = None

    def filter_nodes(self, request):
        location = request.GET.get('location')
        if location:
            self.nodes = self.nodes.filter(location__iexact=location)

        programme = request.GET.get('programme')
        if programme:
            self.nodes = self.nodes.filter(programme=programme)

        from_date = request.GET.get('from')
        if from_date:
            self.nodes = self.nodes.filter(delivery_date__gte=from_date)

        to_date = request.GET.get('to')
        if to_date:
            self.nodes = self.nodes.filter(delivery_date__lte=to_date)

        ip = request.GET.get('ip')
        request.user_profile = UserProfile.objects.filter(user_id=request.user.id).first()

        if request.user_profile:
            ip = request.user_profile.consignee

        if ip:
            self.nodes = self.nodes.filter(ip=ip)


class EndUserStatsSearchData(StatsSearchData):
    def __init__(self):
        StatsSearchData.__init__(self)
        self.flow = Flow.objects.get(for_runnable_type=Runnable.END_USER)
        self.nodes = DeliveryNode.objects.filter(tree_position=DeliveryNode.END_USER, track=True)
        self.received_label = Question.LABEL.productReceived
        self.quality_label = Question.LABEL.qualityOfProduct
        self.satisfied_label = Question.LABEL.satisfiedWithProduct
        self.quality_yes_text = "Good"


class IpStatsSearchData(StatsSearchData):
    def __init__(self):
        StatsSearchData.__init__(self)
        self.flow = Flow.objects.get(for_runnable_type=Runnable.IMPLEMENTING_PARTNER)
        self.nodes = Delivery.objects.filter(track=True)
        self.received_label = Question.LABEL.deliveryReceived
        self.quality_label = Question.LABEL.isDeliveryInGoodOrder
        self.satisfied_label = Question.LABEL.satisfiedWithDelivery
        self.quality_yes_text = "Yes"


class StatsSearchDataFactory:
    def __init__(self):
        pass

    @staticmethod
    def create(tree_position):
        if tree_position == DeliveryNode.IMPLEMENTING_PARTNER:
            return IpStatsSearchData()
        return EndUserStatsSearchData()
