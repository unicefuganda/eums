'use strict';

angular.module('NavigationTabs', [])
    .controller('NavigationTabsController', function($scope, $location) {
        $scope.isActive = function(viewLocation) {
            var active = (viewLocation === $location.path());
            return active;
        };
    });
