from unittest import TestCase

from eums.api.filter.filter_mixin import RequestFilterMixin


class TestRequestFilterMixin(TestCase):
    def setUp(self):
        super(TestRequestFilterMixin, self).setUp()
        self.mixin = RequestFilterMixin()

    def test_should_build_filter_based_on_request(self):
        self.mixin.supported_filters = {
            "query": "query_filter"
        }

        filters = self.mixin.build_filters({'query': 'Unicef'})

        self.assertDictEqual(filters, {'query_filter': 'Unicef'})

    def test_should_not_filter_out_with_unsupported_filters(self):
        self.mixin.supported_filters = {
            "query": "query_filter"
        }

        filters = self.mixin.build_filters({'query': 'Unicef', 'unsupported_filter': 'unsupported_filter'})

        self.assertNotIn('unsupported_filter', filters)

    def test_should_apply_additional_supported_filter(self):
        self.mixin.supported_filters = {
            "query": "query_filter",
            "name": "name_filter"
        }

        filters = self.mixin.build_filters({'query': 'Unicef'}, name='Unicef')

        self.assertDictEqual(filters, {'query_filter': 'Unicef', 'name_filter': 'Unicef'})

    def test_should_build_empty_filter_when_query_params_is_none(self):
        self.assertDictEqual(self.mixin.build_filters(None), {})
