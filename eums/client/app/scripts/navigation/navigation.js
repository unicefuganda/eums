'use strict';

angular.module('NavigationTabs', [])
    .controller('NavigationTabsController', function ($scope, $location) {
        $scope.isActive = function (viewLocation) {
            var allLocations = viewLocation.split(',');
            for (var enabledLocation in allLocations) {
                if (allLocations[enabledLocation] === '/') {
                    return $location.path() === '/';
                }
                else if ($location.path().indexOf(allLocations[enabledLocation]) >= 0) {
                    return true;
                }
            }
            return false;
        };
    });
