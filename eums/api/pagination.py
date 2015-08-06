from rest_framework.pagination import PageNumberPagination

PAGINATION_SIZE = 10


class StandardResultsSetPagination(PageNumberPagination):
    page_size = PAGINATION_SIZE
