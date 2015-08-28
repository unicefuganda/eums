from polymorphic import PolymorphicManager
from django.db import IntegrityError
from eums.models import Arc


class DeliveryNodeManager(PolymorphicManager):
    def create(self, **kwargs):
        is_tracked, parents, quantity = self._get_node_attrs(kwargs)

        if not parents and not quantity >= 0:
            raise IntegrityError('both parents and quantity cannot be null')

        quantity_is_non_zero = self._quantity_is_non_zero(quantity, parents)
        quantity_is_zero = not quantity_is_non_zero
        if quantity_is_non_zero or (quantity_is_zero and not is_tracked):
            node = super(DeliveryNodeManager, self).create(**kwargs)
            self._create_arcs(node, parents, quantity)
            node.update_tracked_status()
            node.update_balance()
            return node
        return self.model(**kwargs)

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
    def _get_node_attrs(kwargs):
        quantity = kwargs.pop('quantity') if 'quantity' in kwargs else None
        parents = kwargs.pop('parents') if 'parents' in kwargs else None
        is_tracked = kwargs.get('track', False)
        return is_tracked, parents, quantity

    def _quantity_is_non_zero(self, quantity, parents):
        if quantity > 0 and not parents:
            return True
        if parents:
            return self._get_total_quantity(parents) > 0
        return False

    @staticmethod
    def _get_total_quantity(parents):
        if type(parents[0]) == dict:
            return reduce(lambda total, parent: total + parent['quantity'], parents, 0)
        return reduce(lambda total, parent: total + parent[1], parents, 0)

    @staticmethod
    def _create_arcs(node, parents, quantity):
        if parents:
            if type(parents[0]) == dict:
                for parent_dict in parents:
                    Arc.objects.create(target=node, source_id=parent_dict['id'], quantity=parent_dict['quantity'])
            elif type(parents[0]) == tuple:
                for parent_tuple in parents:
                    Arc.objects.create(target=node, source=parent_tuple[0], quantity=parent_tuple[1])
        elif quantity:
            Arc.objects.create(target=node, quantity=quantity)
