from polymorphic import PolymorphicManager
from django.db import IntegrityError
from eums.models import Arc


class DeliveryNodeManager(PolymorphicManager):
    def create(self, **kwargs):
        quantity = kwargs.pop('quantity') if 'quantity' in kwargs else None
        parents = kwargs.pop('parents') if 'parents' in kwargs else None
        if not parents and not quantity >= 0:
            raise IntegrityError('both parents and quantity cannot be null')
        is_tracked = kwargs.get('track', False)
        kwargs['track'] = False
        node = super(DeliveryNodeManager, self).create(**kwargs)
        self._create_arcs(node, parents, quantity)
        if quantity == 0 and is_tracked:
            node.delete()
        else:
            node.track = is_tracked
            node.save()
        return node

    def root_nodes_for(self, delivery=None, order_items=None, **kwargs):
        kwargs['arcs_in__source__isnull'] = True
        if delivery:
            return self.model.objects.filter(distribution_plan=delivery, **kwargs)
        elif order_items:
            return self.model.objects.filter(item__in=order_items, **kwargs)
        raise TypeError('both delivery and order items cannot be null')

    def delivered_by_consignee(self, consignee, item_id):
        return self.model.objects.filter(arcs_in__source__consignee=consignee, item__item_id=item_id)

    @staticmethod
    def _create_arcs(node, parents, quantity):
        if parents and len(parents):
            if type(parents[0]) == dict:
                for parent_dict in parents:
                    Arc.objects.create(target=node, source_id=parent_dict['id'], quantity=parent_dict['quantity'])
            elif type(parents[0]) == tuple:
                for parent_tuple in parents:
                    Arc.objects.create(target=node, source=parent_tuple[0], quantity=parent_tuple[1])
        elif quantity:
            Arc.objects.create(target=node, quantity=quantity)
