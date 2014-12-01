'use strict';

angular.module('eums', ['ngRoute', 'Home', 'DistributionPlan', 'NewDistributionPlan', 'NavigationTabs',
    'ngTable', 'siTable', 'ui.bootstrap', 'eums.map', 'eums.ip', 'ManualReporting', 'DatePicker',
    'StockReport', 'ngToast', 'cgBusy', 'Responses', 'Contact', 'ImportData'])
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
            .when('/distribution-plans', {
                templateUrl: '/static/app/views/distribution-planning/distribution-planning.html',
                controller: 'DistributionPlanController'
            })
            .when('/delivery-report/new/:purchaseOrderId-:salesOrderItemId-:distributionPlanNodeId', {
                templateUrl: '/static/app/views/distribution-planning/new.html',
                controller: 'NewDistributionPlanController'
            })
            .when('/delivery-report/new/:purchaseOrderId-:salesOrderItemId', {
                templateUrl: '/static/app/views/distribution-planning/new.html',
                controller: 'NewDistributionPlanController'
            })
            .when('/delivery-report/new/:purchaseOrderId', {
                templateUrl: '/static/app/views/distribution-planning/new.html',
                controller: 'NewDistributionPlanController'
            })
            .when('/distribution-plan/new/:salesOrderId-:salesOrderItemId-:distributionPlanNodeId', {
                templateUrl: '/static/app/views/distribution-planning/new.html',
                controller: 'NewDistributionPlanController'
            })
            .when('/distribution-plan/new/:salesOrderId-:salesOrderItemId', {
                templateUrl: '/static/app/views/distribution-planning/new.html',
                controller: 'NewDistributionPlanController'
            })
            .when('/distribution-plan/new/:salesOrderId', {
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
                controller: 'StockReportController'
            })
            .when('/import-data', {
                templateUrl: '/static/app/views/import-data/import-data.html',
                controller: 'ImportDataController'
            })
            .when('/distribution-plan-responses', {
                templateUrl: '/static/app/views/reports/responses.html',
                controller: 'ResponsesController'
            })
            .when('/contacts', {
                templateUrl: '/static/app/views/contacts/contacts.html',
                controller: 'ContactController'
            })
            .when('/response-details/:district', {
                templateUrl: '/static/app/views/responses/index.html',
                controller: 'ResponseController'
            })
            .otherwise({
                redirectTo: '/'
            });
    }).run(function ($rootScope, $templateCache) {
        $rootScope.$on('$routeChangeStart', function (event, next, current) {
            if (typeof(current) !== 'undefined') {
                $templateCache.remove(current.templateUrl);
            }
        });
    });
