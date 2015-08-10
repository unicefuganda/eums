from eums.models import ConsigneeItem


def update_consignee_stock_level(answer):
    pass


def update_consignee_inventory(answer, rollback=False):
    consignee = answer.run.runnable.consignee
    item = answer.run.runnable.item.item
    yes = answer.question.option_set.get(text='Yes')
    item_was_received = (answer.value == yes)
    item_entry_exists = ConsigneeItem.objects.filter(consignee=consignee, item=item).exists()
    node_id = answer.run.runnable.id

    def _get_item_entry():
        return ConsigneeItem.objects.get(consignee=consignee, item=item)

    def _rollback_consignee_inventory():
        if not answer.question.answers.filter(value=yes, run__runnable=answer.run.runnable).count():
            item_entry = _get_item_entry()
            item_entry.deliveries.remove(node_id)
            item_entry.save()

    if rollback:
        _rollback_consignee_inventory()
        return

    if item_was_received:
        if item_entry_exists:
            item_entry = _get_item_entry()
            deliveries_set = set(item_entry.deliveries)
            deliveries_set.add(node_id)
            item_entry.deliveries = list(deliveries_set)
            item_entry.save()
        else:
            ConsigneeItem.objects.create(consignee=consignee, item=item, deliveries=[node_id])
    elif not item_was_received and item_entry_exists:
        item_entry = _get_item_entry()
        item_entry.deliveries.remove(node_id)
        item_entry.save()
