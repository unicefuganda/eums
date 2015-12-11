'use strict';

angular.module('SystemSettings', ['eums.config', 'User', 'SystemSettingsService', 'Loader'])
    .controller('SystemSettingsController', function ($scope, $timeout, UserService, SystemSettingsService, LoaderService) {
        var current;
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

        $scope.cancelAutoTrack = function () {
            $timeout(function () {
                $scope.isSelected = !$scope.isSelected;
                $scope.$digest();
            });
            LoaderService.hideModal("auto-track-confirm-modal");
        };

        $scope.confirmAutoTrack = function () {
            SystemSettingsService.updateAutoTrack($scope.isSelected).then(function (state) {
                current = $scope.isSelected;
            });
            LoaderService.hideModal("auto-track-confirm-modal");
        };

        (function init() {
            SystemSettingsService.isAutoTrack().then(function (state) {
                current = $scope.isSelected = state;
            });

            $('input[name="auto-track-switch"]').on('init.bootstrapSwitch', function (event, state) {
                $('div.bootstrap-switch span').on('click', function () {
                    LoaderService.showModal("auto-track-confirm-modal");
                });
            });

        })();

    });
