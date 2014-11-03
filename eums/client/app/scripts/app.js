'use strict';

angular.module('eums', ['ngRoute', 'Home', 'DistributionPlan', 'NewDistributionPlan', 'NavigationTabs', 'ngTable', 'siTable', 'ui.bootstrap', 'eums.map', 'eums.ip', 'ManualReporting', 'DatePicker', 'IPStockReport', 'ngToast', 'cgBusy', 'Responses'])
    .config(function ($routeProvider, $httpProvider) {
        $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
        $httpProvider.defaults.xsrfCookieName = 'csrftoken';
        $routeProvider
            .when('/', {
                templateUrl: '/static/app/views/home.html',
                controller: 'HomeController'
            })
            .when('/delivery-reports', {
                templateUrl: '/static/app/views/distribution-planning/distribution-planning.html',
                controller: 'DistributionPlanController'
            })
            .when('/delivery-report/new/:salesOrderId-:salesOrderItemId-:distributionPlanNodeId', {
                templateUrl: '/static/app/views/distribution-planning/new.html',
                controller: 'NewDistributionPlanController'
            })
            .when('/delivery-report/new/:salesOrderId-:salesOrderItemId', {
                templateUrl: '/static/app/views/distribution-planning/new.html',
                controller: 'NewDistributionPlanController'
            })
            .when('/delivery-report/new/:salesOrderId', {
                templateUrl: '/static/app/views/distribution-planning/new.html',
                controller: 'NewDistributionPlanController'
            })
            .when('/delivery-report/proceed/', {
                templateUrl: '/static/app/views/distribution-planning/select-items.html',
                controller: 'NewDistributionPlanController'
            })
            .when('/field-verification-reports', {
                templateUrl: '/static/app/views/distribution-reporting/distribution-reporting.html',
                controller: 'ManualReportingController'
            })
            .when('/field-verification-report/details', {
                templateUrl: '/static/app/views/distribution-reporting/details.html',
                controller: 'ManualReportingController'
            })
            .when('/reports', {
                templateUrl: '/static/app/views/reports/ip-stock-report.html',
                controller: 'IPStockReportController'
            }).when('/distribution-plan-responses', {
                templateUrl: '/static/app/views/reports/responses.html',
                controller: 'responseController'
            })
            .otherwise({
                redirectTo: '/'
            });
    });
