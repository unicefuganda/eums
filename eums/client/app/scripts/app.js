'use strict';

angular.module('eums', ['ngRoute', 'Home', 'DistributionPlan', 'NewDistributionPlan', 'NavigationTabs', 'ngTable', 'siTable', 'ui.bootstrap', 'eums.map', 'eums.ip'])
    .config(function($routeProvider, $httpProvider) {
        $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
        $httpProvider.defaults.xsrfCookieName = 'csrftoken';
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

    }).run(function($rootScope, $routeParams) {
        $rootScope.params = {location: $routeParams};
    });
