'use strict';

angular.module('SystemSettings', ['eums.config', 'User', 'Directives', 'Loader', 'frapontillo.bootstrap-switch'])
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
        $scope.isON = false;

        $scope.isCancelled = false;


        $('input[name="auto-track-switch"]').on('switchChange.bootstrapSwitch', function (event, state) {
            $timeout(function () {
                LoaderService.showModal("auto-track-confirm-modal");
                $scope.isON = state;
            })
        });

        $scope.cancelAutoTrack = function () {

        }

        $scope.confirmAutoTrack = function () {

        }
    });

