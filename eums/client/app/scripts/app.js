'use strict';

angular
    .module('eums', ['ngRoute', 'Home', 'DistributionPlan', 'NavigationTabs', 'ngSanitize', 'flowChart', 'ngTable', 'siTable'])
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
            .otherwise({
                redirectTo: '/'
            });

    });
