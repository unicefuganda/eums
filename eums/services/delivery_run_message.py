from eums.models import ReleaseOrderItem, DistributionPlan


class DeliveryRunMessage():
    def __init__(self, runnable):
        if isinstance(runnable, DistributionPlan):
            self.runnable_wrapper = DeliveryRunnableWrapper(runnable)
        else:
            self.runnable_wrapper = DeliveryNodeRunnableWrapper(runnable)

    def description(self):
        return self.runnable_wrapper.description()


class DeliveryRunnableWrapper():
    def __init__(self, runnable):
        self.runnable = runnable

    def description(self):
        order_item = self.runnable.distributionplannode_set.first().item
        if isinstance(order_item, ReleaseOrderItem):
            label = 'Waybill'
        else:
            label = 'Purchase Order'
        return "%s: %s" % (label, str(order_item.number()))


class DeliveryNodeRunnableWrapper():
    def __init__(self, runnable):
        self.runnable = runnable

    def description(self):
        return self.runnable.item.item.description
