'use strict';

angular.module('GlobalStats', ['eums.config'])
    .factory('DistributionReportService', function($http, EumsConfig) {
        return {
            getReports: function() {
                return $http.get(EumsConfig.DISTRIBUTION_REPORT + '/').then(function(response) {
                    return response.data;
                });
            },
            getTotals: function(reports) {
                var totals = {received: 0, notReceived: 0, distributed: 0, notDistributed: 0};
                reports.forEach(function(report) {
                    totals.received += report.total_received_with_quality_issues +
                        report.total_received_with_quantity_issues +
                        report.total_received_without_issues;

                    totals.distributed += report.total_distributed_with_quality_issues +
                        report.total_distributed_with_quantity_issues +
                        report.total_distributed_without_issues;

                    totals.notDistributed += report.total_not_distributed;

                    totals.notReceived += report.total_not_received;
                });
                return totals;
            }
        }
    });
