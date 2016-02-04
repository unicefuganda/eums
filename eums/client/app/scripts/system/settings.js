'use strict';

angular.module('SystemSettings', ['eums.config', 'User', 'SystemSettingsService', 'Loader',
        'frapontillo.bootstrap-switch', 'ngToast', 'SysUtils'])
    .config(['ngToastProvider', function (ngToast) {
        ngToast.configure({maxNumber: 1, horizontalPosition: 'center'});
    }])
    .controller('SystemSettingsController', function ($scope, $timeout, UserService, SystemSettingsService,
                                                      LoaderService, ngToast, SysUtilsService) {
        var isCancelledOrInitUpdated = false;

        $scope.settings = {};
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
        $scope.settings.syncStartDate = null;
        $scope.currectStartDate = null;
        $scope.isAllowSync = false;
        $scope.currentNotificationMessage = '';
        $scope.notificationMessage = '';

        SystemSettingsService.getSettings().then(function (settings) {
            $scope.settings.syncStartDate = settings.sync_start_date ? new Date(settings.sync_start_date) : null;
            $scope.currectStartDate = $scope.settings.syncStartDate;
            isCancelledOrInitUpdated = $scope.isSelected = settings.auto_track;
            $scope.notificationMessage = $scope.currentNotificationMessage = settings.notification_message;
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
            var updated_status = $scope.isSelected;
            SystemSettingsService.updateSettings({auto_track: updated_status}).then(function () {
                LoaderService.hideModal("auto-track-confirm-modal");
            });
        };

        $scope.saveNotificationMessage = function (isValid) {
            if (isValid) {
                if ($scope.notificationMessage != $scope.currentNotificationMessage) {
                    SystemSettingsService.updateSettings({notification_message: $scope.notificationMessage}).then(function (response) {
                        $scope.currentNotificationMessage = $scope.notificationMessage;
                        ngToast.create({content: "Notification message saved successfully", class: 'success'});
                    });
                } else {
                    ngToast.create({content: "Notification message not changed", class: 'danger'});
                }
            } else {
                ngToast.create({content: "Notification message word limit to 300", class: 'danger'});
            }
        };

        $scope.cancelNotificationMessage = function () {
            $scope.notificationMessage = $scope.currentNotificationMessage;
        };

        $scope.clickSyncBtn = function () {
            if (isNewDate()) {
                $scope.isAllowSync = allowToSync();
                LoaderService.showModal('sync-start-date-confirm-modal');
            }
        };

        $scope.cancelSync = function () {
            LoaderService.hideModal('sync-start-date-confirm-modal');
            $scope.settings.syncStartDate = $scope.currectStartDate;
        };

        $scope.confirmSync = function () {
            LoaderService.hideModal('sync-start-date-confirm-modal');
            $scope.currectStartDate = SysUtilsService.formatDateToYMD($scope.settings.syncStartDate);
            SystemSettingsService.updateSettings({sync_start_date: $scope.currectStartDate});
        };

        function isNewDate() {
            return $scope.currectStartDate == null && $scope.settings.syncStartDate
                || $scope.currectStartDate.toString() != $scope.settings.syncStartDate.toString();
        }

        function allowToSync() {
            return $scope.currectStartDate == null
                || new Date($scope.settings.syncStartDate) < new Date($scope.currectStartDate)
        }
    });
