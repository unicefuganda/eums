'use strict';

angular
    .module('eums', ['ngRoute', 'Home', 'SupplyPlan', 'NavigationTabs'])
    .config(function($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: '/static/app/views/home.html',
                controller: 'HomeController'
            })
            .when('/distribution-planning', {
                templateUrl: '/static/app/views/distribution-planning.html',
                controller: 'DistributionPlanController'
            })
            .otherwise({
                redirectTo: '/'
            });
    });
