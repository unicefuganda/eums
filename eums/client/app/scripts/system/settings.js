'use strict';

angular.module('SystemSettings', ['eums.config', 'User', 'SystemSettingsService', 'Loader', 'frapontillo.bootstrap-switch'])
    .controller('SystemSettingsController', function ($scope, $timeout, UserService, SystemSettingsService, LoaderService) {

        var isCancelledOrInitUpdated = false;

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

        $scope.isON = false;

        SystemSettingsService.isAutoTrack().then(function (state) {
            $scope.isSelected = state;
            isCancelledOrInitUpdated = state;
        });

        $('input[name="auto-track-switch"]').on('switchChange.bootstrapSwitch', function (event, state) {
            $timeout(function () {
                if (isCancelledOrInitUpdated) {
                    isCancelledOrInitUpdated = false;
                    return;
                }
                $scope.isON = state;
                LoaderService.showModal("auto-track-confirm-modal");
            });
        });

        $scope.cancelAutoTrack = function () {
            LoaderService.hideModal("auto-track-confirm-modal");
            isCancelledOrInitUpdated = true;
            $scope.isSelected = !$scope.isSelected;
        };

        $scope.confirmAutoTrack = function () {
            var updated_status = $scope.isSelected
            SystemSettingsService.updateAutoTrack(updated_status).then(function (state) {
                LoaderService.hideModal("auto-track-confirm-modal");
            });
        };
    });
