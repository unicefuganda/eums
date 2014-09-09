'use strict';

angular
    .module('eums', ['ngRoute', 'SupplyPlan'])
    .config(function($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: '/static/app/views/main.html',
                controller: 'SupplyPlanController'
            })
            .otherwise({
                redirectTo: '/'
            });
    });
