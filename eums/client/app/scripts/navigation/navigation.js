'use strict';

angular.module('NavigationTabs', ['Alerts'])
    .controller('NavigationTabsController', function ($scope, $rootScope, $location, AlertsService) {
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

        AlertsService.get('count').then(function (alertsCount) {
            $rootScope.unresolvedAlertsCount = alertsCount.unresolved;
        });

    });
