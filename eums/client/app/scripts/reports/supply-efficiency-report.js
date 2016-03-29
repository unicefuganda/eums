'use strict';

angular.module('SupplyEfficiencyReport', ['eums.config', 'ngTable', 'ngToast', 'siTable', 'eums.ip', 'Consignee', 'Directives',
        'SupplyEfficiencyQueries', 'SysUtils', 'SystemSettingsService', 'ReportService'])
    .controller('SupplyEfficiencyReportController', function ($scope, ngToast, LoaderService, SupplyEfficiencyReportService,
                                                              SysUtilsService, $location, SystemSettingsService, ReportService) {
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

        init();

        $scope.view = $scope.views[urlToViewMapping[viewInUrl]];

        $scope.$on('filters-changed', function (_, newFilters) {
            $scope.filters = newFilters;
            generateReport();
        });

        $scope.formatDate = function (date) {
            return SysUtilsService.formatDate(date);
        };

        $scope.exportToCSV = function () {
            var esQuery = SupplyEfficiencyReportService.getEsQueryParams($scope.view, $scope.filters);
            ReportService.exportSupplyEfficiencyReport(esQuery).then(function (response) {
                ngToast.create({content: response.message, class: 'info'});
            }, function () {
                var errorMessage = "Error while generating CSV. Please contact the system's admin.";
                ngToast.create({content: errorMessage, class: 'danger'})
            });
        };

        function init() {
            loadSystemSettings();
        }

        function loadSystemSettings() {
            SystemSettingsService.getSettingsWithDefault().then(function (settings) {
                $scope.systemSettings = settings;
            });
        }

        function generateReport() {
            LoaderService.showLoader();
            SupplyEfficiencyReportService.generate($scope.view, $scope.filters).then(function (report) {
                $scope.report = report;
                setTotals();
            }, function (response) {
                ngToast.create({content: response.data.message, class: 'info'})
            }).finally(LoaderService.hideLoader);
        }

        function setTotals() {
            if ($scope.report && $scope.report.length > 0) {
                $scope.totals.UNICEFShipped = getTotal($scope.report, 'delivery_stages.unicef.total_value');
                $scope.totals.IPReceived = getTotal($scope.report, 'delivery_stages.ip_receipt.total_value_received');
                $scope.totals.endUserReceived = getTotal($scope.report, 'delivery_stages.end_user.total_value_received');
            } else {
                $scope.totals.UNICEFShipped = 0;
                $scope.totals.IPReceived = 0;
                $scope.totals.endUserReceived = 0;
            }
        }

        function getTotal(array, field) {
            var fields = field.split('.');
            return array.reduce(function (total, current) {
                return current[fields[0]][fields[1]][fields[2]] + total;
            }, 0);
        }
    })
    .factory('SupplyEfficiencyReportService', function ($http, Queries, EumsConfig) {
        var BUCKETS = {
            DELIVERY: 'distribution_plan_id',
            ITEM: 'order_item.item.id',
            OUTCOME: 'programme.id',
            DOCUMENT: 'order_item.order.order_number',
            IP: 'ip.id',
            LOCATION: 'location'
        };

        return {
            generate: function (bucket, filters) {
                var query = Queries.makeQuery(bucket, generateFilters(filters, bucket));
                return $http.post(EumsConfig.BACKEND_URLS.SUPPLY_EFFICIENCY_REPORT, query).then(function (response) {
                    return response.data;
                });
            },
            getEsQueryParams: function (bucket, filters) {
                return Queries.makeQuery(bucket, generateFilters(filters, bucket));
            },
            VIEWS: BUCKETS
        };

        function generateFilters(filters, bucket) {
            var esFilters = [];
            esFilters.push({"term": {"track": "true"}});
            esFilters.push.apply(esFilters, generateFieldFilters(filters, bucket));
            esFilters.push.apply(esFilters, generateDateRangeFilters(filters, bucket));

            if (bucket == BUCKETS.DELIVERY) {
                esFilters.push({"exists": {"field": "distribution_plan_id"}});
            }

            return esFilters;
        }

        function generateDateRangeFilters(filters, bucket) {
            var dateFilters = {};
            var startDate = filters.startDate;
            var endDate = filters.endDate;
            var dateFormat = 'YYYY-MM-DD';

            if (startDate)
                dateFilters.gte = moment(startDate).format(dateFormat);
            if (endDate)
                dateFilters.lte = moment(endDate).format(dateFormat);
            if (Object.size(dateFilters)) {
                return bucket == BUCKETS.DELIVERY ?
                    [{range: {"delivery.delivery_date": Object.merge(dateFilters, {format: 'yyyy-MM-dd'})}}]
                    : [{range: {"delivery_date": Object.merge(dateFilters, {format: 'yyyy-MM-dd'})}}];
            }

            return []
        }

        function generateFieldFilters(filters, bucket) {
            convertLocation(filters, bucket);

            var filterMappings = {
                item: 'order_item.item.id',
                consignee: 'ip.id',
                programme: 'programme.id',
                location: 'location',
                orderNumber: 'order_item.order.order_number',
                deliveryLocation: 'delivery.location'
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

        function convertLocation(filters, bucket) {
            if (bucket == BUCKETS.DELIVERY && filters.hasOwnProperty('location')) {
                filters.delivery = {};
                filters.deliveryLocation = filters.location.toLowerCase();
                delete filters['location']
            }
        }
    });
