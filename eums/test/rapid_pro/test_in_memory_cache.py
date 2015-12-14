from unittest import TestCase

from eums.rapid_pro.in_memory_cache import InMemoryCache

FLOW = {'id': 123, 'label': 'IP'}


class TestInMemoryCache(TestCase):
    def test_cache_should_be_expired_without_sync(self):
        self.assertTrue(InMemoryCache().expired)

    def test_should_be_able_to_update_cache(self):
        cache = InMemoryCache()
        cache.update(flow=FLOW)

        self.assertEqual(cache.flow, FLOW)

    def test_cache_should_be_clean_up_after_invalidate(self):
        cache = InMemoryCache()
        cache.update(flow=FLOW)

        cache.invalidate()

        self.assertEquals(cache.caching, {})
        self.assertEquals(cache.last_sync_time, None)
