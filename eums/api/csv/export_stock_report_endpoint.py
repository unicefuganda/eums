from django.core.urlresolvers import reverse
from rest_framework.response import Response
from rest_framework.views import APIView
from eums.api.stock_report.stock_report_endpoint import filter_stock_report
from eums.services.csv_export_service import generate_delivery_export_csv, \
    generate_delivery_feedback_report, \
    generate_stock_feedback_report


class ExportStockReportViewSet(APIView):
    def get(self, request, *args, **kwargs):
        host_name = request.build_absolute_uri(reverse('home'))
        stocks = filter_stock_report(request)
        stocks = self.join_stock_report(stocks)
        generate_stock_feedback_report.delay(request.user, host_name, stocks)
        message = {'message': 'Generating CSV, you will be notified via email once it is done.'}
        return Response(message, status=200)

    @staticmethod
    def join_stock_report(stocks):
        stock_results = []
        for index, stock in enumerate(stocks):
            for item_index, items in enumerate(stock['items']):
                stock_line = {'item': items}
                for key ,item in enumerate(stock):
                    if item != 'items':
                        stock_line[item] = stock[item]
                stock_results.append(stock_line)
        return stock_results


    def _join_stock_report(self, stocks):
        stock_export_result = []
        for stock in stocks:
            stock_export_result.extend(self._generate_new_stock_row(stock))
        return stock_export_result

    def _generate_new_stock_row(self, stock):
        return [self._update_stock(item, stock) for item in stock['items']]

    @staticmethod
    def _update_stock(item, stock):
        stock = stock.copy()
        stock.update({'item': item})
        if stock.get('items'):
            del stock['items']
        return stock