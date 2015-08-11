from eums.models import ConsigneeItem


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
