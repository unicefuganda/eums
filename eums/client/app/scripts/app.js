'use strict';

angular
    .module('eums', ['ngRoute', 'Home', 'DistributionPlan', 'NavigationTabs', 'ngSanitize', 'flowChart'])
    .config(function($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: '/static/app/views/home.html',
                controller: 'HomeController'
            })
            .when('/distribution-planning', {
                templateUrl: '/static/app/views/distribution-planning/distribution-planning.html',
                controller: 'DistributionPlanController'
            })
            .otherwise({
                redirectTo: '/'
            });
    });
