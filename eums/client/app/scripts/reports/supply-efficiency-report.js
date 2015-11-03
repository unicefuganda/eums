'use strict';

angular.module('SupplyEfficiencyReport', [
    'eums.config', 'ngTable', 'siTable', 'eums.ip', 'Consignee', 'Directives', 'Loader', 'SupplyEfficiencyQueries'])
    .controller('SupplyEfficiencyReportController', function ($scope, LoaderService, SupplyEfficiencyReportService) {
        var views = SupplyEfficiencyReportService.VIEWS;
        $scope.filters = {};
        $scope.$on('filters-changed', function (_, newFilters) {
            $scope.filters = newFilters;
        });

        SupplyEfficiencyReportService.generate(views.DELIVERY, $scope.filters).then(function (report) {
            $scope.report = report;
        });
    }).factory('SupplyEfficiencyReportService', function ($http, Queries, EumsConfig) {
        var VIEWS = {DELIVERY: 1};
        var url = EumsConfig.ELASTIC_SEARCH_URL + '_search?search_type=count';
        return {
            generate: function (view, filters) {
                if (view == VIEWS.DELIVERY && !Object.size(filters)) {
                    return $http.post(url, Queries.baseQuery).then(function (response) {
                        return parseReport(response.data);
                    });
                }
            },
            VIEWS: VIEWS
        };

        function parseReport(response_data) {
            var buckets = response_data.aggregations.deliveries.buckets;
            return buckets.map(function (bucket) {
                var stages = bucket.delivery_stages.buckets;
                var value_delivered_to_ip = stages.ip.total_value_delivered.value;
                var value_received_by_ip = value_delivered_to_ip - stages.ip.total_loss.value;
                var value_distributed_by_ip = stages.distributed_by_ip.total_value_delivered.value;

                return {
                    identifier: bucket.identifier.hits.hits.first()._source,
                    delivery_stages: {
                        unicef: {
                            total_value: parseFloat(value_delivered_to_ip).toFixed()
                        },
                        ip_receipt: {
                            total_value_received: parseFloat(value_received_by_ip).toFixed(),
                            total_loss: parseFloat(stages.ip.total_loss.value).toFixed(),
                            average_delay: stages.ip.average_delay.value
                        },
                        ip_distribution: {
                            total_value_distributed: parseFloat(value_distributed_by_ip).toFixed(),
                            balance: parseFloat(value_received_by_ip - value_distributed_by_ip).toFixed()
                        },
                        end_user: {
                            total_value_received: parseFloat(stages.end_users.total_value_delivered.value).toFixed(),
                            total_loss: parseFloat(stages.end_users.total_loss.value).toFixed(),
                            average_delay: stages.end_users.average_delay.value
                        }
                    }
                }
            });
        }
    });
