'use strict';

angular.module('GlobalStats', ['eums.config'])
    .factory('DistributionReportService', function ($http, EumsConfig) {

        var computeTotals = function (reports) {
            var totals = {received: 0, notReceived: 0, distributed: 0, notDistributed: 0};
            reports.forEach(function (report) {
                totals.received += report.amountReceived ? parseInt(report.amountReceived) : 0;
                totals.distributed += report.amountSent ? parseInt(report.amountSent) : 0;
            });
            totals.notDistributed = totals.received - totals.distributed;
            return totals;
        };

        return {
            getReports: function () {
                return $http.get(EumsConfig.BACKEND_URLS.DISTRIBUTION_REPORT).then(function (response) {
                    return response.data;
                });
            },
            getTotals: function (reports, options) {
                if (options) {
                    var consignee = parseInt(options.consignee);
                    var programme = parseInt(options.programme);
                    var filteredReports = reports.filter(function (report) {
                        if (consignee && programme) {
                            return report.consignee.id === consignee && report.programme.id === programme;
                        }
                        else if (consignee) {
                            return report.consignee.id === consignee;
                        }
                        else if (programme) {
                            return report.programme.id === programme;
                        }
                    });

                    return computeTotals(filteredReports);
                }
                return computeTotals(reports);
            }
        };
    });
