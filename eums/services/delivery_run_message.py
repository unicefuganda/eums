from eums.models import ReleaseOrderItem, DistributionPlan


class DeliveryRunMessage():
    UNICEF_SENDER = 'UNICEF'

    def __init__(self, runnable):
        if isinstance(runnable, DistributionPlan):
            self.runnable_wrapper = DeliveryRunnableWrapper(runnable)
        else:
            self.runnable_wrapper = DeliveryNodeRunnableWrapper(runnable)

    def description(self):
        return self.runnable_wrapper.description()

    def sender_name(self):
        return self.runnable_wrapper.sender_name()


class DeliveryRunnableWrapper():
    def __init__(self, runnable):
        self.runnable = runnable

    def description(self):
        order_item = self.runnable.distributionplannode_set.first().item
        label = 'Waybill' if isinstance(order_item, ReleaseOrderItem) else 'Purchase Order'
        return "%s: %s" % (label, str(order_item.number()))

    def sender_name(self):
        return DeliveryRunMessage.UNICEF_SENDER


class DeliveryNodeRunnableWrapper():
    def __init__(self, runnable):
        self.runnable = runnable

    def description(self):
        return self.runnable.item.item.description

    def sender_name(self):
        return self.runnable.sender_name()
