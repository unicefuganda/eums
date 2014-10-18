'use strict';

angular.module('GlobalStats', ['eums.config'])
    .factory('DistributionReportService', function($http, EumsConfig) {

        var computeTotals = function(reports) {
            var totals = {received: 0, notReceived: 0, distributed: 0, notDistributed: 0};
            reports.forEach(function(report) {
                totals.received += report.total_received;
                totals.distributed += report.total_distributed;
                totals.notReceived += report.total_not_received;
            });
            totals.notDistributed = totals.received - totals.distributed;
            return totals;
        };

        return {
            getReports: function() {
                return $http.get(EumsConfig.BACKEND_URLS.DISTRIBUTION_REPORT).then(function(response) {
                    return response.data;
                });
            },
            getTotals: function(reports, options) {
                if(options) {
                    var consignee = options.consignee;
                    var programme = options.programme;
                    var filteredReports = reports.filter(function(report) {
                        if(consignee && programme) {
                            return report.consignee === consignee && report.programme === programme;
                        }
                        else if(consignee) {
                             return report.consignee === consignee;
                        }
                        else if(programme) {
                             return report.programme === programme;
                        }
                    });

                    return computeTotals(filteredReports);
                }
                return computeTotals(reports);
            }
        };
    });