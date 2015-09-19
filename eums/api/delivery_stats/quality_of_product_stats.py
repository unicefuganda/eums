from django.db.models import Q

from eums.models import MultipleChoiceQuestion, Option, MultipleChoiceAnswer, Run


class QualityOfProductMixin(object):
    def __init__(self):
        super(QualityOfProductMixin, self).__init__()
        self.quality_of_product_qn = MultipleChoiceQuestion.objects.get(label='qualityOfProduct',
                                                                        flow=self.end_user_flow)
        self.was_good = Option.objects.get(text='Good', question=self.quality_of_product_qn)
        self.good_quality_delivery_answers = MultipleChoiceAnswer.objects.filter(
            question=self.quality_of_product_qn, value=self.was_good).filter(
            Q(run__status=Run.STATUS.scheduled) | Q(run__status=Run.STATUS.completed)
        )
        # self.unsuccessful_delivery_answers = MultipleChoiceAnswer.objects.filter(
        #     question=self.quality_of_product_qn, value=self.product_was_not_received).filter(
        #     Q(run__status=Run.STATUS.scheduled) | Q(run__status=Run.STATUS.completed)
        # )

    def number_of_deliveries_in_good_order(self):
        return self.good_quality_delivery_answers.count()
    #
    # def percentage_of_deliveries_in_good_order(self):
    #     return self._percentage_of_total_deliveries(self.number_of_successful_deliveries())

    # def number_of_deliveries_in_bad_order(self):
    #     runs_with_answers = MultipleChoiceAnswer.objects.filter(question=self.was_product_received).values_list(
    #         'run_id')
    #     return self.end_user_nodes.exclude(run__id__in=runs_with_answers).distinct().count()

        # def number_of_unsuccessful_deliveries(self):
        #     return self.total_deliveries() - self.number_of_successful_deliveries() - self.number_of_non_response_deliveries()
        #

        # def percent_unsuccessful_deliveries(self):
        #     return self._percentage_of_total_deliveries(self.number_of_unsuccessful_deliveries())
        #
        # def percent_non_response_deliveries(self):
        #     return self._percentage_of_total_deliveries(self.number_of_non_response_deliveries())
        #
        # def total_successful_delivery_value(self):
        #     successful_delivery_runs = self.successful_delivery_answers.values_list('run_id')
        #     successful_nodes = self.end_user_nodes.filter(run__id__in=successful_delivery_runs)
        #     return self._get_nodes_total_value(successful_nodes)
        #
        # def percentage_value_of_successful_deliveries(self):
        #     return self._percentage_of_total_value_delivered(self.total_successful_delivery_value())
        #
        # def total_unsuccessful_delivery_value(self):
        #     unsuccessful_delivery_runs = self.unsuccessful_delivery_answers.values_list('run_id')
        #     unsuccessful_nodes = self.end_user_nodes.filter(run__id__in=unsuccessful_delivery_runs)
        #     return self._get_nodes_total_value(unsuccessful_nodes)
        #
        # def percentage_value_of_unsuccessful_deliveries(self):
        #     return self._percentage_of_total_value_delivered(self.total_unsuccessful_delivery_value())
        #
        # def total_value_of_non_response_deliveries(self):
        #     total_successful_delivery_value = self.total_successful_delivery_value() or 0
        #     total_unsuccessful_delivery_value = self.total_unsuccessful_delivery_value() or 0
        #     return self.total_delivery_value() - total_successful_delivery_value - total_unsuccessful_delivery_value
        #
        # def percentage_value_of_non_response_deliveries(self):
        #     return self._percentage_of_total_value_delivered(self.total_value_of_non_response_deliveries())
