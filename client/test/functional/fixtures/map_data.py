import json

map_data_file = open('client/test/functional/fixtures/mapdata-2.json')
fixtures = json.load(map_data_file)

output_file = open('client/test/functional/fixtures/mapdata_code.py', 'w')

output_file.write('from eums.models import Consignee\n')
output_file.write('from eums.models import DistributionPlan\n')
output_file.write('from eums.models import DistributionPlanNode\n')
output_file.write('from eums.models import ItemUnit\n')
output_file.write('from eums.models import SalesOrder\n')
output_file.write('from eums.models import PurchaseOrder\n')
output_file.write('from eums.models import ReleaseOrder\n')
output_file.write('from eums.models import OrderItem\n')
output_file.write('from eums.models import SalesOrderItem\n')
output_file.write('from eums.models import PurchaseOrderItem\n')
output_file.write('from eums.models import ReleaseOrderItem\n')
output_file.write('from eums.models import Item\n')
output_file.write('from eums.models import Programme\n')
output_file.write('from eums.models import DistributionReport\n')
output_file.write('from eums.models import Run\n')
output_file.write('from eums.models import Question\n')
output_file.write('from eums.models import NumericAnswer\n')
output_file.write('from eums.models import NumericQuestion\n')
output_file.write('from eums.models import TextAnswer\n')
output_file.write('from eums.models import TextQuestion\n')
output_file.write('from eums.models import MultipleChoiceAnswer\n')
output_file.write('from eums.models import MultipleChoiceQuestion\n')
output_file.write('from eums.models import Option\n\n')


# Consignees
consignees = filter(lambda fixture: fixture['model'] == 'eums.consignee', fixtures)
for consignee in consignees:
    fields = consignee['fields']
    fields_string = 'name="%s", imported_from_vision=%s, location=%s, remarks="%s", customer_id="%s", type="%s"' % (
        fields['name'], fields['imported_from_vision'], fields['location'], fields.get('remarks') or '',
        fields['customer_id'], fields['type'])
    output_file.write('consignee_%d = Consignee.objects.create(%s) \n' % (consignee['pk'], fields_string))


# Programmes
output_file.write('\n\n')
programmes = filter(lambda fixture: fixture['model'] == 'eums.programme', fixtures)
for programme in programmes:
    fields = programme['fields']
    fields_string = 'wbs_element_ex="%s", name="%s"' % (fields['wbs_element_ex'], fields['name'])
    output_file.write('programme_%d = Programme.objects.create(%s) \n' % (programme['pk'], fields_string))


# Runnables
runnables = filter(lambda fixture: fixture['model'] == 'eums.runnable', fixtures)


def find_runnable_for(runnable_dict):
    return filter(lambda runnable: runnable['pk'] == runnable_dict['pk'], runnables)[0]


# Deliveries
output_file.write('\n\n')
deliveries = filter(lambda fixture: fixture['model'] == 'eums.distributionplan', fixtures)
for delivery in deliveries:
    fields = delivery['fields']
    runnable_fields = find_runnable_for(delivery)['fields']
    fields_string = 'date="%s", programme=%s, location="%s", consignee=%s, contact_person_id="%s", track=%s,  ' \
                    'delivery_date="%s", remark="%s"' % (
                        fields['date'], 'programme_%d' % fields['programme'], runnable_fields['location'],
                        'consignee_%d' % runnable_fields['consignee'], runnable_fields['contact_person_id'],
                        runnable_fields['track'], runnable_fields['delivery_date'], runnable_fields['remark'] or '')
    output_file.write('delivery_%d = DistributionPlan.objects.create(%s) \n' % (delivery['pk'], fields_string))

output_file.write('\n\n')
item_units = filter(lambda fixture: fixture['model'] == 'eums.itemunit', fixtures)
for unit in item_units:
    fields = unit['fields']
    fields_string = 'name="%s"' % fields['name']
    output_file.write('item_unit_%d = ItemUnit.objects.create(%s) \n' % (unit['pk'], fields_string))


# Sales Orders
output_file.write('\n\n')
sales_orders = filter(lambda fixture: fixture['model'] == 'eums.salesorder', fixtures)
for order in sales_orders:
    fields = order['fields']
    fields_string = 'date="%s", description="%s", order_number=%d, programme=%s' % (
        fields['date'], fields['description'], fields['order_number'], 'programme_%d' % fields['programme'])
    output_file.write('sales_order_%d = SalesOrder.objects.create(%s) \n' % (order['pk'], fields_string))


# Purchase Orders
output_file.write('\n\n')
purchase_orders = filter(lambda fixture: fixture['model'] == 'eums.purchaseorder', fixtures)
for order in purchase_orders:
    fields = order['fields']
    fields_string = 'date="%s", order_number=%d, is_single_ip=%s, sales_order=%s, po_type="%s"' % (
        fields['date'], fields['order_number'], fields['is_single_ip'] or False,
        'sales_order_%d' % fields['sales_order'],
        fields['po_type'] or '')
    output_file.write('po_%d = PurchaseOrder.objects.create(%s) \n' % (order['pk'], fields_string))


# Release Orders
output_file.write('\n\n')
release_orders = filter(lambda fixture: fixture['model'] == 'eums.releaseorder', fixtures)
for order in release_orders:
    fields = order['fields']
    fields_string = 'sales_order=%s, waybill=%d, consignee=%s, purchase_order=%s, order_number=%d, delivery_date="%s"' \
                    % ('sales_order_%d' % fields['sales_order'], fields['waybill'],
                       'consignee_%d' % fields['consignee'], 'po_%d' % fields['purchase_order'],
                       fields['order_number'], fields['delivery_date'])
    output_file.write('ro_%d = ReleaseOrder.objects.create(%s) \n' % (order['pk'], fields_string))


# Order Items
order_items = filter(lambda fixture: fixture['model'] == 'eums.orderitem', fixtures)


def find_order_item_for(order_item_dict):
    return filter(lambda item: item['pk'] == order_item_dict['pk'], order_items)[0]


# Items
output_file.write('\n\n')
items = filter(lambda fixture: fixture['model'] == 'eums.item', fixtures)
for item in items:
    fields = item['fields']
    fields_string = 'material_code="%s", description="%s", unit=%s' % (
        fields['material_code'], fields['description'], 'item_unit_%s' % fields['unit'])
    output_file.write('item_%d = Item.objects.create(%s) \n' % (item['pk'], fields_string))


# Sales order items
output_file.write('\n\n')
so_items = filter(lambda fixture: fixture['model'] == 'eums.salesorderitem', fixtures)
for order_item in so_items:
    fields = order_item['fields']
    order_item_fields = find_order_item_for(order_item)['fields']
    fields_string = 'issue_date="%s", description="%s", sales_order=%s, net_price=%s, net_value=%s, delivery_date="%s", item=%s, item_number=%d, quantity=%s' \
                    % (fields['issue_date'], fields['description'], 'sales_order_%d' % fields['sales_order'],
                       fields['net_price'], fields['net_value'], fields['delivery_date'],
                       'item_%d' % order_item_fields['item'], order_item_fields['item_number'],
                       order_item_fields['quantity'])
    output_file.write('so_item_%d = SalesOrderItem.objects.create(%s) \n' % (order_item['pk'], fields_string))


# Purchase Order Items
output_file.write('\n\n')
po_items = filter(lambda fixture: fixture['model'] == 'eums.purchaseorderitem', fixtures)
for order_item in po_items:
    fields = order_item['fields']
    order_item_fields = find_order_item_for(order_item)['fields']
    fields_string = 'purchase_order=%s, sales_order_item=%s, value=%s, item=%s, item_number=%d, quantity=%s' % (
        'po_%d' % fields['purchase_order'], 'so_item_%d' % fields['sales_order_item'], fields['value'],
        'item_%d' % order_item_fields['item'], order_item_fields['item_number'], order_item_fields['quantity'])
    output_file.write('po_item_%d = PurchaseOrderItem.objects.create(%s) \n' % (order_item['pk'], fields_string))


# Release Order Items
output_file.write('\n\n')
ro_items = filter(lambda fixture: fixture['model'] == 'eums.releaseorderitem', fixtures)
for order_item in ro_items:
    fields = order_item['fields']
    order_item_fields = find_order_item_for(order_item)['fields']
    fields_string = 'purchase_order_item=%s, release_order=%s, value=%s, item=%s, item_number=%d, quantity=%s' % (
        'po_item_%d' % fields['purchase_order_item'], 'ro_%d' % fields['release_order'], fields['value'],
        'item_%d' % order_item_fields['item'], order_item_fields['item_number'], order_item_fields['quantity'])
    output_file.write('ro_item_%d = ReleaseOrderItem.objects.create(%s) \n' % (order_item['pk'], fields_string))


# Delivery Nodes
output_file.write('\n\n')
delivery_nodes = filter(lambda fixture: fixture['model'] == 'eums.distributionplannode', fixtures)
for node in delivery_nodes:
    fields = node['fields']
    runnable_fields = find_runnable_for(node)['fields']
    if not fields['parent']:
        fields_string = 'distribution_plan=%s, quantity=%d, tree_position="%s", item=%s, location="%s",' \
                        'consignee=%s, contact_person_id="%s", track=%s, delivery_date="%s", remark="%s"' % (
                            'delivery_%d' % fields['distribution_plan'], fields['targeted_quantity'],
                            fields['tree_position'], 'OrderItem.objects.get(pk=%d)' % fields['item'],
                            runnable_fields['location'],
                            'consignee_%d' % runnable_fields['consignee'], runnable_fields['contact_person_id'],
                            runnable_fields['track'], runnable_fields['delivery_date'], runnable_fields['remark'] or '')
    else:
        fields_string = 'distribution_plan=%s, parents=[(%s, %d)], tree_position="%s", item=%s, location="%s", ' \
                        'consignee=%s, contact_person_id="%s", track=%s, delivery_date="%s", remark="%s"' % (
                            'delivery_%d' % fields['distribution_plan'], 'node_%d' % fields['parent'],
                            fields['targeted_quantity'], fields['tree_position'],
                            'OrderItem.objects.get(pk=%d)' % fields['item'], runnable_fields['location'],
                            'consignee_%d' % runnable_fields['consignee'], runnable_fields['contact_person_id'],
                            runnable_fields['track'], runnable_fields['delivery_date'], runnable_fields['remark'] or '')
    output_file.write('node_%d = DistributionPlanNode.objects.create(%s) \n' % (node['pk'], fields_string))


# Runs
output_file.write('\n\n')
runs = filter(lambda fixture: fixture['model'] == 'eums.run', fixtures)
for run in runs:
    fields = run['fields']
    fields_string = 'runnable=%s, status="%s", scheduled_message_task_id="%s", phone="%s"' % (
        'node_%d' % fields['runnable'], fields['status'], fields['scheduled_message_task_id'], fields['phone'])
    output_file.write('run_%d = Run.objects.create(%s) \n' % (run['pk'], fields_string))


# Questions
output_file.write('\n\n')
questions = filter(lambda fixture: fixture['model'] == 'eums.question', fixtures)
for question in questions:
    fields = question['fields']
    fields_string = 'text="%s", uuids=%s, label="%s"' % (
        fields['text'], fields['uuids'], fields['label'])
    output_file.write('question_%d = Question.objects.create(%s) \n' % (question['pk'], fields_string))


# Multiple Choice Questions
output_file.write('\n\n')
mc_questions = filter(lambda fixture: fixture['model'] == 'eums.multiplechoicequestion', fixtures)
for question in mc_questions:
    output_file.write(
        'mc_question_%d = MultipleChoiceQuestion.objects.create(label="%s") \n' % (question['pk'], question['pk']))


# Numeric Questions
output_file.write('\n\n')
numeric_questions = filter(lambda fixture: fixture['model'] == 'eums.numericquestion', fixtures)
for question in numeric_questions:
    output_file.write(
        'numeric_question_%d = NumericQuestion.objects.create(label="%s") \n' % (question['pk'], question['pk']))


# Text Questions
output_file.write('\n\n')
text_questions = filter(lambda fixture: fixture['model'] == 'eums.textquestion', fixtures)
for question in text_questions:
    output_file.write(
        'text_question_%d = TextQuestion.objects.create(label="%s") \n' % (question['pk'], question['pk']))


# Numeric Answers
output_file.write('\n\n')
numeric_answers = filter(lambda fixture: fixture['model'] == 'eums.numericanswer', fixtures)
for answer in numeric_answers:
    fields = answer['fields']
    fields_string = 'run=%s, question=%s, value=%d' % (
        'run_%d' % fields['run'], 'numeric_question_%d' % fields['question'], fields['value'])
    output_file.write('NumericAnswer.objects.create(%s) \n' % fields_string)


# Text Answers
output_file.write('\n\n')
text_answers = filter(lambda fixture: fixture['model'] == 'eums.textanswer', fixtures)
for answer in text_answers:
    fields = answer['fields']
    fields_string = 'run=%s, question=%s, value="%s"' % (
        'run_%d' % fields['run'], 'text_question_%d' % fields['question'], fields['value'])
    output_file.write('TextAnswer.objects.create(%s) \n' % fields_string)


# Options
output_file.write('\n\n')
options = filter(lambda fixture: fixture['model'] == 'eums.option', fixtures)
for option in options:
    fields = option['fields']
    fields_string = 'text="%s", question=%s' % (fields['text'], 'mc_question_%d' % fields['question'])
    output_file.write('option_%d = Option.objects.create(%s) \n' % (option['pk'], fields_string))


# Multiple Choice Answers
output_file.write('\n\n')
mc_answers = filter(lambda fixture: fixture['model'] == 'eums.multiplechoiceanswer', fixtures)
for answer in mc_answers:
    fields = answer['fields']
    fields_string = 'run=%s, question=%s, value=%s' % (
        'run_%d' % fields['run'], 'mc_question_%d' % fields['question'], 'option_%d' % fields['value'])
    output_file.write('MultipleChoiceAnswer.objects.create(%s) \n' % fields_string)


# Distribution report
output_file.write('\n\n')
output_file.write('DistributionReport.objects.create(total_distributed=80, total_not_received=67, '
                  'consignee=consignee_32, total_received=100, programme=programme_3)')

output_file.close()
