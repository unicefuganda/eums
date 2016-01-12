class RequestFilterMixin(object):
    def build_filters(self, query_params, **additional_filters):
        supported_filters = self.supported_filters if hasattr(self, 'supported_filters') else {}
        filters = {query: query_params.get(query) for query in supported_filters.keys()}

        if additional_filters is not None:
            filters.update(additional_filters)

        if supported_filters is not None:
            return {supported_filters.get(key): value for key, value in filters.iteritems() if value and value is not None}

        return {}
