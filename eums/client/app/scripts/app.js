'use strict';

angular
    .module('eums', ['ngRoute', 'Home', 'DistributionPlan', 'NewDistributionPlan', 'NavigationTabs', 'ngTable', 'siTable'])
    .config(function ($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: '/static/app/views/home.html',
                controller: 'HomeController'
            })
            .when('/distribution-planning', {
                templateUrl: '/static/app/views/distribution-planning/distribution-planning.html',
                controller: 'DistributionPlanController'
            })
            .when('/distribution-plan/new/', {
                templateUrl: '/static/app/views/distribution-planning/new.html',
                controller: 'NewDistributionPlanController'
            })
            .when('/distribution-plan/proceed/', {
                templateUrl: '/static/app/views/distribution-planning/select-items.html',
                controller: 'NewDistributionPlanController'
            })
            .otherwise({
                redirectTo: '/'
            });

    });
