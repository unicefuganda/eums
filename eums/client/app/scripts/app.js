'use strict';

angular
    .module('eums', ['ngRoute', 'Home', 'SupplyPlan'])
    .config(function($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: '/static/app/views/home.html',
                controller: 'HomeController'
            })
            .when('/supply-planning', {
                templateUrl: '/static/app/views/supply-planning.html',
                controller: 'SupplyPlanController'
            })
            .otherwise({
                redirectTo: '/'
            });
    });
