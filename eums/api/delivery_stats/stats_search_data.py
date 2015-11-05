from eums.models import UserProfile, Flow, Runnable, Question, DistributionPlanNode as DeliveryNode, \
    DistributionPlan as Delivery, MultipleChoiceAnswer, Item, NumericAnswer


class StatsSearchData:
    def __init__(self):
        self.nodes = None

    def filter_nodes(self, request, **kwargs):
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

        sort_by = kwargs.get('sort_by')
        if sort_by:
            self.nodes = self.nodes.order_by(sort_by)

    @staticmethod
    def _get_yes_or_no(received_answer):
        if not received_answer:
            return False
        _received_answer = received_answer.latest('created')
        return _received_answer.value.text == "Yes"


class EndUserStatsSearchData(StatsSearchData):
    def __init__(self):
        StatsSearchData.__init__(self)
        self.flow = Flow.objects.get(for_runnable_type=Runnable.END_USER)
        self.nodes = DeliveryNode.objects.filter(tree_position=DeliveryNode.END_USER, track=True)
        self.received_label = Question.LABEL.productReceived
        self.quality_label = Question.LABEL.qualityOfProduct
        self.satisfied_label = Question.LABEL.satisfiedWithProduct
        self.quality_yes_text = "Good"
        self.amount_received_label = Question.LABEL.amountReceived

    def latest_deliveries(self, limit):
        limit = limit or 3
        answers = MultipleChoiceAnswer.objects.filter(question__flow=self.flow,
                                                      run__runnable__in=self.nodes)
        nodes_with_answers_ids = answers.values_list('run__runnable')
        latest_items_ids = self.nodes.filter(id__in=nodes_with_answers_ids).values_list('item__item', flat=True).distinct()[:limit]
        return [self._delivery_data(item_id) for item_id in latest_items_ids]

    def _delivery_data(self, item_id):
        item = Item.objects.get(id=item_id)
        node = self.nodes.filter(item__item=item).latest('created')
        received_answer = MultipleChoiceAnswer.objects.filter(question__flow=self.flow,
                                                              run__runnable=node,
                                                              question__label=self.received_label)
        good_condition_answer = MultipleChoiceAnswer.objects.filter(question__flow=self.flow,
                                                                    run__runnable=node,
                                                                    question__label=self.quality_label)
        amount_received_answer = NumericAnswer.objects.filter(question__flow=self.flow,
                                                              run__runnable=node,
                                                              question__label=self.amount_received_label)

        received = self._get_yes_or_no(received_answer)
        quality = self._get_answer_value(good_condition_answer)
        amount_received = self._get_answer_value(amount_received_answer)
        result = {'name': item.description, 'amountSent': node.quantity_in(), 'productReceived': received}
        if received:
            result.update({'amountReceived': amount_received, 'qualityOfProduct': quality})
        return result

    @staticmethod
    def _get_answer_value(answers):
        if not answers:
            return ""
        answer = answers.latest('created')
        return answer.format()


class IpStatsSearchData(StatsSearchData):
    def __init__(self):
        StatsSearchData.__init__(self)
        self.flow = Flow.objects.get(for_runnable_type=Runnable.IMPLEMENTING_PARTNER)
        self.nodes = Delivery.objects.filter(track=True)
        self.received_label = Question.LABEL.deliveryReceived
        self.quality_label = Question.LABEL.isDeliveryInGoodOrder
        self.satisfied_label = Question.LABEL.satisfiedWithDelivery
        self.quality_yes_text = "Yes"

    def latest_deliveries(self, limit):
        limit = limit or 3
        answers = MultipleChoiceAnswer.objects.filter(question__flow=self.flow,
                                                      run__runnable__in=self.nodes)
        nodes_with_answers_ids = answers.values_list('run__runnable')
        nodes_with_answers = self.nodes.filter(id__in=nodes_with_answers_ids)[:limit]
        return [self._delivery_data(node) for node in nodes_with_answers]

    def _delivery_data(self, node):
        received_answer = MultipleChoiceAnswer.objects.filter(question__flow=self.flow,
                                                              run__runnable=node,
                                                              question__label=self.received_label)
        good_condition_answer = MultipleChoiceAnswer.objects.filter(question__flow=self.flow,
                                                                    run__runnable=node,
                                                                    question__label=self.quality_label)
        satisfied_answer = MultipleChoiceAnswer.objects.filter(question__flow=self.flow,
                                                               run__runnable=node,
                                                               question__label=self.satisfied_label)

        delivery_date = node.delivery_date.strftime("%d-%b-%Y")
        received = self._get_yes_or_no(received_answer)
        quality = self._get_yes_or_no(good_condition_answer)
        satisfied = self._get_yes_or_no(satisfied_answer)
        return {'deliveryName': '%s on %s' % (node.location, delivery_date), 'received': received,
                'inGoodCondition': quality, 'satisfied': satisfied}


class StatsSearchDataFactory:
    def __init__(self):
        pass

    @staticmethod
    def create(tree_position):
        if tree_position == DeliveryNode.IMPLEMENTING_PARTNER:
            return IpStatsSearchData()
        return EndUserStatsSearchData()
