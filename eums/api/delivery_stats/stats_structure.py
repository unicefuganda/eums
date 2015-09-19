from collections import namedtuple

BaseQuerySets = namedtuple('BaseQuerySets', 'positive_answers negative_answers runs_with_answers')
DeliveryStats = namedtuple('DeliveryStats', 'count_positive count_negative count_non_response '
                                            'percent_positive percent_negative percent_non_response '
                                            'value_positive value_negative value_non_response '
                                            'percent_value_positive percent_value_negative percent_value_non_response')
