from eums.client.test.functional.fixtures.mapdata_runs import run_87
from eums.fixtures.ip_questions import *
from eums.test.factories.answer_factory import MultipleChoiceAnswerFactory

MultipleChoiceAnswerFactory(question=ip_questions['WAS_DELIVERY_RECEIVED'],
                            value=ip_options['DELIVERY_WAS_NOT_RECEIVED'],
                            run=run_87)
