from unittest import TestCase

from eums.vision.sales_order_synchronizer import SalesOrderSynchronizer


class TestSalesOrderSynchronizer(TestCase):
    def test_should_convert_wbs_code_format(self):
        wbs_1 = '0060A007883001002'

        self.assertEqual(SalesOrderSynchronizer._convert_wbs_code_format(wbs_1), '0060/A0/07/883')
