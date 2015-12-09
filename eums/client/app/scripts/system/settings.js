'use strict';

angular.module('DirectDelivery', ['eums.config', 'User', 'Directives', 'Loader', 'frapontillo.bootstrap-switch'])
    .controller('SystemSettingsController', function ($scope, UserService, LoaderService, $timeout) {
        $scope.isSelected = false;
        $scope.onText = 'ON';
        $scope.offText = 'OFF';
        $scope.isActive = true;
        $scope.size = 'normal';
        $scope.animate = true;
        $scope.radioOff = true;
        $scope.handleWidth = "auto";
        $scope.labelWidth = "auto";
        $scope.inverse = true;

        //$scope.activeAutoTrack = true;

        $('input[name="auto-track-switch"]').on('switchChange.bootstrapSwitch', function (event, state) {
            $timeout(function () {
                $scope.isON = state;
                $scope.$digest();
            });
            LoaderService.showModal("auto-track-confirm-modal");
        });

    });

