from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

PAGINATION_SIZE = 10


class StandardResultsSetPagination(PageNumberPagination):
    page_size = PAGINATION_SIZE

    def get_paginated_response(self, data):
        return Response({
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'count': self.page.paginator.count,
            'pageSize': self.page_size,
            'results': data
        })
