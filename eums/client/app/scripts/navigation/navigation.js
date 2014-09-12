'use strict';

angular.module('NavigationTabs', [])
    .controller('NavigationTabsController', function($scope, $location) {
        $scope.isActive = function(viewLocation) {
            return viewLocation === $location.path();
        };
    });
