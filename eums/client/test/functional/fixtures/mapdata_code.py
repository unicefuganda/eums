from eums.client.test.functional.fixtures.mapdata_runs import *
from eums.fixtures import web_questions, ip_questions
from eums.client.test.functional.fixtures.mapdata_release_order_items import *
from eums.fixtures.ip_questions import seed_ip_questions
from eums.models import DistributionReport, Alert
from eums.models import NumericAnswer
from eums.models import TextAnswer
from eums.models import MultipleChoiceAnswer
from eums.fixtures.end_user_questions import *
from eums.test.factories.alert_factory import AlertFactory
from eums.test.factories.answer_factory import MultipleChoiceAnswerFactory, NumericAnswerFactory, TextAnswerFactory
from eums.test.factories.delivery_factory import DeliveryFactory
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory
from eums.test.factories.run_factory import RunFactory

NumericAnswer.objects.create(run=run_7, question=EU_AMOUNT_RECEIVED, value=50)
NumericAnswer.objects.create(run=run_8, question=EU_AMOUNT_RECEIVED, value=10)
NumericAnswer.objects.create(run=run_9, question=EU_AMOUNT_RECEIVED, value=30)
NumericAnswer.objects.create(run=run_10, question=EU_AMOUNT_RECEIVED, value=20)
NumericAnswer.objects.create(run=run_11, question=EU_AMOUNT_RECEIVED, value=30)
NumericAnswer.objects.create(run=run_12, question=EU_AMOUNT_RECEIVED, value=10)
NumericAnswer.objects.create(run=run_12, question=EU_AMOUNT_RECEIVED, value=10)
NumericAnswer.objects.create(run=run_14, question=EU_AMOUNT_RECEIVED, value=20)
NumericAnswer.objects.create(run=run_16, question=EU_AMOUNT_RECEIVED, value=60)
NumericAnswer.objects.create(run=run_16, question=EU_AMOUNT_RECEIVED, value=20)
NumericAnswer.objects.create(run=run_17, question=EU_AMOUNT_RECEIVED, value=100)
NumericAnswer.objects.create(run=run_18, question=EU_AMOUNT_RECEIVED, value=1)
NumericAnswer.objects.create(run=run_20, question=EU_AMOUNT_RECEIVED, value=1)
NumericAnswer.objects.create(run=run_20, question=EU_AMOUNT_RECEIVED, value=1)
NumericAnswer.objects.create(run=run_22, question=EU_AMOUNT_RECEIVED, value=1)
NumericAnswer.objects.create(run=run_23, question=EU_AMOUNT_RECEIVED, value=1)

TextAnswer.objects.create(run=run_7, question=EU_DATE_RECEIVED, value='6/10/2014')
TextAnswer.objects.create(run=run_7, question=EU_REVISED_DELIVERY_DATE, value='didnt not specify')
TextAnswer.objects.create(run=run_7, question=EU_DISSATISFACTION_FEEDBACK, value='they were damaged')

MultipleChoiceAnswer.objects.create(run=run_7, question=WAS_PRODUCT_RECEIVED, value=PRODUCT_WAS_RECEIVED)
MultipleChoiceAnswer.objects.create(run=run_7, question=EU_QUALITY_OF_PRODUCT, value=EU_OPT_DAMAGED)
MultipleChoiceAnswer.objects.create(run=run_7, question=EU_SATISFACTION, value=EU_OPT_NOT_SATISFIED)
MultipleChoiceAnswer.objects.create(run=run_7, question=EU_INFORMED_OF_DELAY, value=EU_OPT_NOT_SATISFIED)
MultipleChoiceAnswer.objects.create(run=run_8, question=WAS_PRODUCT_RECEIVED, value=PRODUCT_WAS_RECEIVED)
MultipleChoiceAnswer.objects.create(run=run_7, question=EU_QUALITY_OF_PRODUCT, value=EU_OPT_GOOD)
MultipleChoiceAnswer.objects.create(run=run_7, question=EU_SATISFACTION, value=PRODUCT_WAS_RECEIVED)
MultipleChoiceAnswer.objects.create(run=run_9, question=WAS_PRODUCT_RECEIVED, value=EU_OPT_NOT_SATISFIED)
MultipleChoiceAnswer.objects.create(run=run_9, question=EU_INFORMED_OF_DELAY, value=EU_OPT_NOT_SATISFIED)
MultipleChoiceAnswer.objects.create(run=run_10, question=WAS_PRODUCT_RECEIVED, value=PRODUCT_WAS_RECEIVED)
MultipleChoiceAnswer.objects.create(run=run_10, question=EU_QUALITY_OF_PRODUCT, value=EU_OPT_EXPIRED)
MultipleChoiceAnswer.objects.create(run=run_10, question=EU_SATISFACTION, value=EU_OPT_NOT_SATISFIED)
MultipleChoiceAnswer.objects.create(run=run_11, question=WAS_PRODUCT_RECEIVED, value=PRODUCT_WAS_RECEIVED)
MultipleChoiceAnswer.objects.create(run=run_11, question=EU_QUALITY_OF_PRODUCT, value=EU_OPT_DAMAGED)
MultipleChoiceAnswer.objects.create(run=run_11, question=EU_SATISFACTION, value=EU_OPT_NOT_SATISFIED)
MultipleChoiceAnswer.objects.create(run=run_12, question=WAS_PRODUCT_RECEIVED, value=PRODUCT_WAS_RECEIVED)
MultipleChoiceAnswer.objects.create(run=run_12, question=EU_QUALITY_OF_PRODUCT, value=EU_OPT_GOOD)
MultipleChoiceAnswer.objects.create(run=run_12, question=EU_SATISFACTION, value=PRODUCT_WAS_RECEIVED)
MultipleChoiceAnswer.objects.create(run=run_13, question=WAS_PRODUCT_RECEIVED, value=PRODUCT_WAS_RECEIVED)
MultipleChoiceAnswer.objects.create(run=run_13, question=EU_QUALITY_OF_PRODUCT, value=EU_OPT_GOOD)
MultipleChoiceAnswer.objects.create(run=run_13, question=EU_SATISFACTION, value=PRODUCT_WAS_RECEIVED)
MultipleChoiceAnswer.objects.create(run=run_14, question=WAS_PRODUCT_RECEIVED, value=EU_OPT_NOT_SATISFIED)
MultipleChoiceAnswer.objects.create(run=run_14, question=EU_INFORMED_OF_DELAY, value=PRODUCT_WAS_RECEIVED)
MultipleChoiceAnswer.objects.create(run=run_15, question=WAS_PRODUCT_RECEIVED, value=PRODUCT_WAS_RECEIVED)
MultipleChoiceAnswer.objects.create(run=run_15, question=EU_QUALITY_OF_PRODUCT, value=EU_OPT_GOOD)
MultipleChoiceAnswer.objects.create(run=run_15, question=EU_SATISFACTION, value=PRODUCT_WAS_RECEIVED)
MultipleChoiceAnswer.objects.create(run=run_16, question=WAS_PRODUCT_RECEIVED, value=PRODUCT_WAS_RECEIVED)
MultipleChoiceAnswer.objects.create(run=run_16, question=EU_SATISFACTION, value=EU_OPT_SATISFIED)
MultipleChoiceAnswer.objects.create(run=run_17, question=WAS_PRODUCT_RECEIVED, value=EU_OPT_NOT_SATISFIED)
MultipleChoiceAnswer.objects.create(run=run_17, question=EU_INFORMED_OF_DELAY, value=EU_OPT_NOT_SATISFIED)
MultipleChoiceAnswer.objects.create(run=run_18, question=WAS_PRODUCT_RECEIVED, value=PRODUCT_WAS_RECEIVED)
MultipleChoiceAnswer.objects.create(run=run_17, question=EU_QUALITY_OF_PRODUCT, value=EU_OPT_DAMAGED)
MultipleChoiceAnswer.objects.create(run=run_18, question=EU_SATISFACTION, value=EU_OPT_NOT_SATISFIED)
MultipleChoiceAnswer.objects.create(run=run_19, question=WAS_PRODUCT_RECEIVED, value=PRODUCT_WAS_RECEIVED)
MultipleChoiceAnswer.objects.create(run=run_19, question=EU_QUALITY_OF_PRODUCT, value=EU_OPT_GOOD)
MultipleChoiceAnswer.objects.create(run=run_19, question=EU_SATISFACTION, value=PRODUCT_WAS_RECEIVED)
MultipleChoiceAnswer.objects.create(run=run_20, question=WAS_PRODUCT_RECEIVED, value=EU_OPT_NOT_SATISFIED)
MultipleChoiceAnswer.objects.create(run=run_20, question=EU_INFORMED_OF_DELAY, value=PRODUCT_WAS_RECEIVED)
MultipleChoiceAnswer.objects.create(run=run_21, question=WAS_PRODUCT_RECEIVED, value=PRODUCT_WAS_RECEIVED)
MultipleChoiceAnswer.objects.create(run=run_21, question=EU_QUALITY_OF_PRODUCT, value=EU_OPT_DAMAGED)
MultipleChoiceAnswer.objects.create(run=run_21, question=EU_SATISFACTION, value=EU_OPT_NOT_SATISFIED)
MultipleChoiceAnswer.objects.create(run=run_22, question=WAS_PRODUCT_RECEIVED, value=PRODUCT_WAS_RECEIVED)
MultipleChoiceAnswer.objects.create(run=run_22, question=EU_QUALITY_OF_PRODUCT, value=EU_OPT_DAMAGED)
MultipleChoiceAnswer.objects.create(run=run_22, question=EU_SATISFACTION, value=EU_OPT_NOT_SATISFIED)
MultipleChoiceAnswer.objects.create(run=run_23, question=WAS_PRODUCT_RECEIVED, value=PRODUCT_WAS_RECEIVED)
MultipleChoiceAnswer.objects.create(run=run_23, question=EU_QUALITY_OF_PRODUCT, value=EU_OPT_DAMAGED)
MultipleChoiceAnswer.objects.create(run=run_23, question=EU_SATISFACTION, value=EU_OPT_NOT_SATISFIED)

DistributionReport.objects.create(total_distributed=80, total_not_received=67, consignee=consignee_32,
                                  total_received=100, programme=programme_3)

# WEB RUNS
web_flow = Flow.objects.get(for_runnable_type='WEB')
was_item_received = MultipleChoiceQuestion.objects.get(flow=web_flow, label='itemReceived')
yes = Option.objects.get(question=was_item_received, text='Yes')

wakiso = Consignee.objects.get(name='WAKISO DHO')
plan = DeliveryFactory()
wakiso_node_1 = DeliveryNodeFactory(consignee=wakiso, item=po_item_1, quantity=100, distribution_plan=plan)
wakiso_node_2 = DeliveryNodeFactory(consignee=wakiso, item=po_item_2, quantity=60, distribution_plan=plan)
wakiso_node_3 = DeliveryNodeFactory(consignee=wakiso, item=po_item_3, quantity=300, distribution_plan=plan)

MultipleChoiceAnswerFactory(question=was_item_received, value=yes, run=RunFactory(runnable=wakiso_node_1))
MultipleChoiceAnswerFactory(question=was_item_received, value=yes, run=RunFactory(runnable=wakiso_node_2))
MultipleChoiceAnswerFactory(question=was_item_received, value=yes, run=RunFactory(runnable=wakiso_node_3))

# item deliveries made by wakiso
DeliveryNodeFactory(parents=[(wakiso_node_1, 60)], tree_position="END_USER", item=po_item_1, distribution_plan=plan)
DeliveryNodeFactory(parents=[(wakiso_node_1, 40)], tree_position="MIDDLE_MAN", item=po_item_1, distribution_plan=plan)
DeliveryNodeFactory(parents=[(wakiso_node_2, 58)], tree_position="END_USER", item=po_item_2, distribution_plan=plan)

# alerts
AlertFactory(order_type=ReleaseOrderItem.WAYBILL, order_number=123456, issue=Alert.ISSUE_TYPES.not_received,
             is_resolved=False,
             consignee_name='Some Consignee Name', contact_name='Some Contact Name',
             item_description="Some Description")
AlertFactory(order_type=PurchaseOrderItem.PURCHASE_ORDER, order_number=654321, issue=Alert.ISSUE_TYPES.bad_condition,
             is_resolved=True)

# web answers

MultipleChoiceAnswerFactory(question=web_questions.web_question_1, value=web_questions.yes_1, run=run_77)
NumericAnswerFactory(question=web_questions.web_question_2, value=50, run=run_77)
MultipleChoiceAnswerFactory(question=web_questions.web_question_3, value=web_questions.expired, run=run_77)
MultipleChoiceAnswerFactory(question=web_questions.web_question_4, value=web_questions.yes_2, run=run_77)
TextAnswerFactory(question=web_questions.web_question_5, value='nothing much', run=run_77)

MultipleChoiceAnswerFactory(question=web_questions.web_question_1, value=web_questions.yes_1, run=run_78)
NumericAnswerFactory(question=web_questions.web_question_2, value=70, run=run_78)
MultipleChoiceAnswerFactory(question=web_questions.web_question_3, value=web_questions.damaged, run=run_78)
MultipleChoiceAnswerFactory(question=web_questions.web_question_4, value=web_questions.no_2, run=run_78)
TextAnswerFactory(question=web_questions.web_question_5, value='nothing much', run=run_78)

MultipleChoiceAnswerFactory(question=web_questions.web_question_1, value=web_questions.yes_1, run=run_79)
NumericAnswerFactory(question=web_questions.web_question_2, value=93, run=run_79)
MultipleChoiceAnswerFactory(question=web_questions.web_question_3, value=web_questions.substandard, run=run_79)
MultipleChoiceAnswerFactory(question=web_questions.web_question_4, value=web_questions.yes_2, run=run_79)
TextAnswerFactory(question=web_questions.web_question_5, value='nothing much', run=run_79)

# delivery answers
TextAnswerFactory(question=ip_questions.ip_question_2, value='12/02/2015', run=run_80)

MultipleChoiceAnswerFactory(question=ip_questions.ip_question_1, value=ip_questions.ip_yes, run=run_81)
TextAnswerFactory(question=ip_questions.ip_question_2, value='12/02/2015', run=run_81)

MultipleChoiceAnswerFactory(question=ip_questions.ip_question_1, value=ip_questions.ip_yes, run=run_82)
TextAnswerFactory(question=ip_questions.ip_question_2, value='12/02/2015', run=run_82)

MultipleChoiceAnswerFactory(question=web_questions.web_question_1, value=web_questions.yes_1, run=run_83)
NumericAnswerFactory(question=web_questions.web_question_2, value=80, run=run_83)
MultipleChoiceAnswerFactory(question=web_questions.web_question_3, value=web_questions.good, run=run_83)
MultipleChoiceAnswerFactory(question=web_questions.web_question_4, value=web_questions.yes_2, run=run_83)
TextAnswerFactory(question=web_questions.web_question_5, value='nothing much', run=run_83)

MultipleChoiceAnswerFactory(question=web_questions.web_question_1, value=web_questions.yes_1, run=run_84)
NumericAnswerFactory(question=web_questions.web_question_2, value=500, run=run_84)
MultipleChoiceAnswerFactory(question=web_questions.web_question_3, value=web_questions.good, run=run_84)
MultipleChoiceAnswerFactory(question=web_questions.web_question_4, value=web_questions.yes_2, run=run_84)
TextAnswerFactory(question=web_questions.web_question_5, value='nothing much', run=run_84)

MultipleChoiceAnswerFactory(question=web_questions.web_question_1, value=web_questions.yes_1, run=run_85)
NumericAnswerFactory(question=web_questions.web_question_2, value=700, run=run_85)
MultipleChoiceAnswerFactory(question=web_questions.web_question_3, value=web_questions.good, run=run_85)
MultipleChoiceAnswerFactory(question=web_questions.web_question_4, value=web_questions.yes_2, run=run_85)
TextAnswerFactory(question=web_questions.web_question_5, value='nothing much', run=run_85)

MultipleChoiceAnswerFactory(question=web_questions.web_question_1, value=web_questions.yes_1, run=run_86)
NumericAnswerFactory(question=web_questions.web_question_2, value=3000, run=run_86)
MultipleChoiceAnswerFactory(question=web_questions.web_question_3, value=web_questions.good, run=run_86)
MultipleChoiceAnswerFactory(question=web_questions.web_question_4, value=web_questions.yes_2, run=run_86)
TextAnswerFactory(question=web_questions.web_question_5, value='nothing much', run=run_86)

# data for home page
import datetime

ip_questions, options, _ = seed_ip_questions()

today = FakeDate.today()
delivery_pader = DeliveryFactory(location='PADER', track=True, programme=programme_4, consignee=wakiso,
                                 ip=wakiso, delivery_date=today + datetime.timedelta(days=3))

delivery_Amuru = DeliveryFactory(location='Amuru', delivery_date=today, track=True)

run_delivery_pader = RunFactory(runnable=delivery_pader, status=Run.STATUS.scheduled)
run_delivery_amuru = RunFactory(runnable=delivery_Amuru, status=Run.STATUS.scheduled)

MultipleChoiceAnswerFactory(run=run_delivery_pader, question=ip_questions['WAS_DELIVERY_RECEIVED'],
                            value=options['DELIVERY_WAS_RECEIVED'])
TextAnswerFactory(run=run_delivery_pader, question=ip_questions['DATE_OF_RECEIPT'], value=options['2014-09-29'])
MultipleChoiceAnswerFactory(run_delivery_pader, question=ip_questions['IS_DELIVERY_IN_GOOD_ORDER'],
                            value=options['IN_GOOD_CONDITION'])
MultipleChoiceAnswerFactory(run_delivery_pader, question=ip_questions['SATISFIED_WITH_DELIVERY'],
                            value=options['SATISFIED'])
TextAnswerFactory(run=run_delivery_pader, question=ip_questions['ADDITIONAL_DELIVERY_COMMENTS'], value=options['none'])

non_response_delivery_one = DeliveryFactory(delivery_date=today + datetime.timedelta(days=4), location='PADER',
                                            track=True)

RunFactory(runnable=non_response_delivery_one, status=Run.STATUS.scheduled)


# end user nodes for home page
end_user_questions, options = seed_questions()

po_item = PurchaseOrderItemFactory(quantity=100, value=1000)
ip_node_one = DeliveryNodeFactory(tree_position=Runnable.IMPLEMENTING_PARTNER, track=True, quantity=10,
                                  distribution_plan=delivery_pader, item=po_item)
ip_node_two = DeliveryNodeFactory(tree_position=Runnable.IMPLEMENTING_PARTNER, track=True, quantity=20,
                                  distribution_plan=delivery_pader, item=po_item)

run_ip_node_one = RunFactory(runnable=ip_node_one, status=Run.STATUS.scheduled)
run_ip_node_two = RunFactory(runnable=ip_node_two, status=Run.STATUS.scheduled)

MultipleChoiceAnswerFactory(question=web_questions.web_question_1, value=web_questions.yes_1, run=run_ip_node_one)
NumericAnswerFactory(question=web_questions.web_question_2, value=10, run=run_ip_node_one)
MultipleChoiceAnswerFactory(question=web_questions.web_question_3, value=web_questions.good, run=run_ip_node_one)
MultipleChoiceAnswerFactory(question=web_questions.web_question_4, value=web_questions.yes_2, run=run_ip_node_one)
TextAnswerFactory(question=web_questions.web_question_5, value='nothing much', run=run_ip_node_one)

MultipleChoiceAnswerFactory(question=web_questions.web_question_1, value=web_questions.yes_1, run=run_ip_node_two)
NumericAnswerFactory(question=web_questions.web_question_2, value=20, run=run_ip_node_two)
MultipleChoiceAnswerFactory(question=web_questions.web_question_3, value=web_questions.good, run=run_ip_node_two)
MultipleChoiceAnswerFactory(question=web_questions.web_question_4, value=web_questions.yes_2, run=run_ip_node_two)
TextAnswerFactory(question=web_questions.web_question_5, value='nothing much', run=run_ip_node_two)

end_user_node_one = DeliveryNodeFactory(tree_position=Runnable.END_USER, track=True, item=po_item,
                                        parents=((ip_node_one, 5),))
run_end_user_node_one = RunFactory(runnable=end_user_node_one, status=Run.STATUS.scheduled)

MultipleChoiceAnswerFactory(run=run_end_user_node_one, question=end_user_questions['WAS_PRODUCT_RECEIVED'],
                            value=options['PRODUCT_WAS_RECEIVED'])
MultipleChoiceAnswerFactory(run=run_end_user_node_one, question=end_user_questions['QUALITY_OF_PRODUCT'],
                            value=options['IN_GOOD_CONDITION'])
MultipleChoiceAnswerFactory(run=run_end_user_node_one, question=end_user_questions['SATISFACTION_WITH_PRODUCT'],
                            value=options['SATISFIED'])
NumericAnswerFactory(run=run_end_user_node_one, question=end_user_questions['EU_AMOUNT_RECEIVED'], value=5)




end_user_node_two = DeliveryNodeFactory(tree_position=Runnable.END_USER, track=True,
                                        parents=((ip_node_two, 5), (ip_node_one, 1)),
                                        distribution_plan=delivery_Amuru, item=po_item, consignee=consignee_10,
                                        programm=programme_4)
run_end_user_node_two = RunFactory(runnable=end_user_node_two, status=Run.STATUS.scheduled)

MultipleChoiceAnswerFactory(run=run_end_user_node_two, question=end_user_questions['WAS_PRODUCT_RECEIVED'],
                            value=options['PRODUCT_WAS_RECEIVED'])
MultipleChoiceAnswerFactory(run=run_end_user_node_two, question=end_user_questions['QUALITY_OF_PRODUCT'],
                            value=options['IN_GOOD_CONDITION'])
MultipleChoiceAnswerFactory(run=run_end_user_node_two, question=end_user_questions['SATISFACTION_WITH_PRODUCT'],
                            value=options['SATISFIED'])
NumericAnswerFactory(run=run_end_user_node_two, question=end_user_questions['EU_AMOUNT_RECEIVED'], value=6)




end_user_node_three = DeliveryNodeFactory(tree_position=Runnable.END_USER, track=True,
                                          distribution_plan=None, item=po_item, parents=((ip_node_two, 2),))
run_end_user_node_three = RunFactory(runnable=end_user_node_three, status=Run.STATUS.scheduled)

MultipleChoiceAnswerFactory(run=run_end_user_node_three, question=end_user_questions['WAS_PRODUCT_RECEIVED'],
                            value=options['PRODUCT_WAS_RECEIVED'])
MultipleChoiceAnswerFactory(run=run_end_user_node_three, question=end_user_questions['QUALITY_OF_PRODUCT'],
                            value=options['IN_GOOD_CONDITION'])
MultipleChoiceAnswerFactory(run=run_end_user_node_three, question=end_user_questions['SATISFACTION_WITH_PRODUCT'],
                            value=options['SATISFIED'])
NumericAnswerFactory(run=run_end_user_node_three, question=end_user_questions['EU_AMOUNT_RECEIVED'], value=2)




end_user_node_four = DeliveryNodeFactory(tree_position=Runnable.END_USER, track=True,
                                         distribution_plan=None, parents=((ip_node_two, 1), (ip_node_one, 3)),
                                         item=po_item)
end_user_node_four = DeliveryNodeFactory(tree_position=Runnable.END_USER, track=True,
                                          distribution_plan=None, item=po_item, parents=((ip_node_two, 2),))
run_end_user_node_four = RunFactory(runnable=end_user_node_four, status=Run.STATUS.scheduled)

MultipleChoiceAnswerFactory(run=run_end_user_node_four, question=end_user_questions['WAS_PRODUCT_RECEIVED'],
                            value=options['PRODUCT_WAS_RECEIVED'])
MultipleChoiceAnswerFactory(run=run_end_user_node_four, question=end_user_questions['QUALITY_OF_PRODUCT'],
                            value=options['IN_GOOD_CONDITION'])
MultipleChoiceAnswerFactory(run=run_end_user_node_four, question=end_user_questions['SATISFACTION_WITH_PRODUCT'],
                            value=options['NOT_SATISFIED'])
NumericAnswerFactory(run=run_end_user_node_four, question=end_user_questions['EU_AMOUNT_RECEIVED'], value=4)




non_response_node = DeliveryNodeFactory(tree_position=Runnable.END_USER, track=True,
                                        distribution_plan=None, parents=((ip_node_two, 2),),
                                        item=po_item)
RunFactory(runnable=non_response_node, status=Run.STATUS.scheduled)
