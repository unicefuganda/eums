from rest_framework.response import Response
from rest_framework.views import APIView

from eums.api.delivery_stats.stats_search_data import StatsSearchDataFactory
from eums.models import DistributionPlanNode as DeliveryNode


class LatestDeliveriesEndpoint(APIView):
    def get(self, request, *args, **kwargs):
        tree_position = request.GET.get('treePosition', DeliveryNode.END_USER)
        stats_search_data = StatsSearchDataFactory.create(tree_position)
        stats_search_data.filter_nodes(request, sort_by='-delivery_date')
        data = stats_search_data.latest_deliveries(limit=request.GET.get('limit'))
        return Response(data, status=200)
