'use strict';

angular.module('SupplyEfficiencyReport', [
    'eums.config', 'ngTable', 'siTable', 'eums.ip', 'Consignee', 'Directives', 'SupplyEfficiencyQueries'])
    .controller('SupplyEfficiencyReportController', function ($scope, LoaderService, SupplyEfficiencyReportService, $location) {
        $scope.views = SupplyEfficiencyReportService.VIEWS;
        $scope.filters = {};
        $scope.totals = {};

        var urlToViewMapping = {
            delivery: 'DELIVERY',
            item: 'ITEM',
            outcome: 'OUTCOME',
            document: 'DOCUMENT',
            ip: 'IP',
            location: 'LOCATION'
        };
        var viewInUrl = $location.search().by;
        $scope.view = $scope.views[urlToViewMapping[viewInUrl]];

        generateReport();

        $scope.$on('filters-changed', function (_, newFilters) {
            $scope.filters = newFilters;
            generateReport();
        });

        function generateReport() {
            LoaderService.showLoader();
            SupplyEfficiencyReportService.generate($scope.view, $scope.filters).then(function (report) {
                $scope.report = report;
                setTotals();
                LoaderService.hideLoader();
            });
        }

        function setTotals() {
            if($scope.report && $scope.report.length > 0) {
                $scope.totals.UNICEFShipped = $scope.report.reduce(function (total, current) {
                    return current.delivery_stages.unicef.total_value + total;
                }, 0);

                $scope.totals.IPReceived = $scope.report.reduce(function (total, current) {
                    return current.delivery_stages.ip_receipt.total_value_received + total;
                }, 0);

                $scope.totals.endUserReceived = $scope.report.reduce(function (total, current) {
                    return current.delivery_stages.end_user.total_value_received + total;
                }, 0);
            }
        }
    })
    .factory('SupplyEfficiencyReportService', function ($http, Queries, EumsConfig) {
        var BUCKETS = {
            DELIVERY: 'distribution_plan_id',
            ITEM: 'order_item.item.id',
            OUTCOME: 'programme.id',
            LOCATION: 'location',
            IP: 'ip.id',
            DOCUMENT: 'order_item.order.order_number'
        };
        var url = EumsConfig.ELASTIC_SEARCH_URL + '_search?search_type=count';
        return {
            generate: function (bucket, filters) {
                var query = Queries.makeQuery(bucket, generateFilters(filters, bucket));
                return $http.post(url, query).then(function (response) {
                    return parseReport(response.data);
                });
            },
            VIEWS: BUCKETS
        };

        function generateFilters(filters, bucket) {
            var esFilters = [];
            esFilters.push.apply(esFilters, generateFieldFilters(filters));
            esFilters.push.apply(esFilters, generateDateRangeFilters(filters));

            if (bucket == BUCKETS.DELIVERY) {
                esFilters.push({"exists": {"field": "distribution_plan_id"}});
            }

            return esFilters;
        }

        function generateDateRangeFilters(filters) {
            var dateFilters = {};
            var startDate = filters.startDate;
            var endDate = filters.endDate;
            var dateFormat = 'YYYY-MM-DD';

            if (startDate)
                dateFilters.gte = moment(startDate).format(dateFormat);
            if (endDate)
                dateFilters.lte = moment(endDate).format(dateFormat);
            if (Object.size(dateFilters))
                return [{range: {delivery_date: Object.merge(dateFilters, {format: 'yyyy-MM-dd'})}}];

            return []
        }

        function generateFieldFilters(filters) {
            var filterMappings = {
                item: 'order_item.item.id',
                consignee: 'ip.id',
                programme: 'programme.id',
                location: 'location',
                orderNumber: 'order_item.order.order_number'
            };

            var fieldFilters = [];

            Object.each(filters, function (key, value) {
                var filter = {term: {}};
                var filterMappingKey = filterMappings[key];
                if (filterMappingKey) {
                    filter.term[filterMappingKey] = value;
                    fieldFilters.push(filter);
                }
            });

            return fieldFilters;
        }

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
                            total_value: roundAggregate(value_delivered_to_ip)
                        },
                        ip_receipt: {
                            total_value_received: roundAggregate(value_received_by_ip),
                            confirmed: roundAggregate((value_received_by_ip/value_delivered_to_ip) * 100),
                            average_delay: roundAggregate(stages.ip.average_delay.value)
                        },
                        ip_distribution: {
                            total_value_distributed: roundAggregate(value_distributed_by_ip),
                            balance: roundAggregate(value_received_by_ip - value_distributed_by_ip)
                        },
                        end_user: {
                            total_value_received: roundAggregate(stages.end_users.total_value_delivered.value),
                            confirmed: roundAggregate((stages.end_users.total_value_delivered.value/value_delivered_to_ip)*100),
                            average_delay: roundAggregate(stages.end_users.average_delay.value)
                        }
                    }
                }
            });

            function roundAggregate(aggregate) {
                return parseInt(aggregate) || 0;
            }
        }
    });
