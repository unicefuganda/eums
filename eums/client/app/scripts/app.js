'use strict';

angular
    .module('eums', ['ngRoute', 'mainController'])
    .config(function($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: '/static/app/views/main.html',
                controller: 'MainCtrl'
            })
            .otherwise({
                redirectTo: '/'
            });
    });
