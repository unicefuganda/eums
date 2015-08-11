from eums.models import ConsigneeItem


class UpdateConsigneeStockLevel:
    def __init__(self, *args, **kwargs):
        pass

    def run(self):
        pass

    def rollback(self):
        pass


class UpdateConsigneeInventory:
    def __init__(self, answer):
        self.answer = answer
        self.consignee = self.answer.run.runnable.consignee
        self.item = self.answer.run.runnable.item.item
        self.yes = self.answer.question.option_set.get(text='Yes')
        self.item_was_received = (answer.value == self.yes)
        self.item_entry_exists = ConsigneeItem.objects.filter(consignee=self.consignee, item=self.item).exists()
        self.node = answer.run.runnable
        self.question = self.answer.question

    def run(self):
        if self.item_was_received:
            if self.item_entry_exists:
                item_entry = self._get_item_entry()
                deliveries_set = set(item_entry.deliveries)
                deliveries_set.add(self.node.id)
                item_entry.deliveries = list(deliveries_set)
                item_entry.save()
            else:
                ConsigneeItem.objects.create(consignee=self.consignee, item=self.item, deliveries=[self.node.id])
        elif not self.item_was_received and self.item_entry_exists:
            item_entry = self._get_item_entry()
            item_entry.deliveries.remove(self.node.id)
            item_entry.save()

    def rollback(self):
        if not self.question.answers.filter(value=self.yes, run__runnable=self.node).count():
            item_entry = self._get_item_entry()
            item_entry.deliveries.remove(self.node.id)
            item_entry.save()

    def _get_item_entry(self):
        return ConsigneeItem.objects.get(consignee=self.consignee, item=self.item)

# def update_consignee_inventory(answer, rollback=False):
#     consignee = answer.run.runnable.consignee
#     item = answer.run.runnable.item.item
#     yes = answer.question.option_set.get(text='Yes')
#     item_was_received = (answer.value == yes)
#     item_entry_exists = ConsigneeItem.objects.filter(consignee=consignee, item=item).exists()
#     node_id = answer.run.runnable.id
#
#     def _get_item_entry():
#         return ConsigneeItem.objects.get(consignee=consignee, item=item)
#
#     def _rollback_consignee_inventory():
#         if not answer.question.answers.filter(value=yes, run__runnable=answer.run.runnable).count():
#             item_entry = _get_item_entry()
#             item_entry.deliveries.remove(node_id)
#             item_entry.save()
#
#     if rollback:
#         _rollback_consignee_inventory()
#         return
#
#     if item_was_received:
#         if item_entry_exists:
#             item_entry = _get_item_entry()
#             deliveries_set = set(item_entry.deliveries)
#             deliveries_set.add(node_id)
#             item_entry.deliveries = list(deliveries_set)
#             item_entry.save()
#         else:
#             ConsigneeItem.objects.create(consignee=consignee, item=item, deliveries=[node_id])
#     elif not item_was_received and item_entry_exists:
#         item_entry = _get_item_entry()
#         item_entry.deliveries.remove(node_id)
#         item_entry.save()
