from eums.models import ConsigneeItem


class UpdateConsigneeStockLevel:
    def __init__(self, answer):
        self.answer = answer
        self.consignee = self.answer.run.runnable.consignee
        self.node = self.answer.run.runnable
        self.question = self.answer.question
        self.item = self.answer.run.runnable.item.item
        self.amount_received = self.answer.value
    #   TODO assert that item entry exists

    def run(self):
        entry = self._get_item_entry()
        entry.amount_received += self.amount_received
        entry.save()

    def rollback(self):
        entry = self._get_item_entry()
        entry.amount_received -= self.amount_received
        entry.save()

    def _get_item_entry(self):
        return ConsigneeItem.objects.get(consignee=self.consignee, item=self.item)
