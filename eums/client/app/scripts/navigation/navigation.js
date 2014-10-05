'use strict';

angular.module('NavigationTabs', [])
    .controller('NavigationTabsController', function($scope, $location) {
        $scope.isActive = function(viewLocation) {
            var allLocations = viewLocation.split(',');
            return allLocations.indexOf($location.path()) !== -1;
        };
    });
