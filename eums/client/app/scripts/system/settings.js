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
        $scope.currentDistrictLabel = '';
        $scope.notificationMessage = '';

        init();

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

        $scope.saveMessages = function (isValid) {
            if (!isValid) {
                ngToast.create({content: "The form data is invalid", class: 'danger'});
                return;
            }

            if ($scope.notificationMessage != $scope.currentNotificationMessage ||
                $scope.districtLabel != $scope.currentDistrictLabel) {
                SystemSettingsService.updateSettings({
                    notification_message: $scope.notificationMessage,
                    district_label: $scope.districtLabel
                }).then(function (response) {
                    $scope.currentNotificationMessage = $scope.notificationMessage;
                    $scope.currentDistrictLabel = $scope.districtLabel;
                    ngToast.create({content: "Settings saved successfully", class: 'success'});
                });
            } else {
                ngToast.create({content: "Settings not changed", class: 'danger'});
            }
        };

        $scope.cancelMessages = function () {
            $scope.notificationMessage = $scope.currentNotificationMessage;
            $scope.districtLabel = $scope.currentDistrictLabel;
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

        function init() {
            SystemSettingsService.getSettings().then(function (settings) {
                $scope.settings.syncStartDate = settings.sync_start_date ? new Date(settings.sync_start_date) : null;
                $scope.currectStartDate = $scope.settings.syncStartDate;
                $scope.notificationMessage = $scope.currentNotificationMessage = settings.notification_message;
                $scope.districtLabel = $scope.currentDistrictLabel = settings.district_label;
                isCancelledOrInitUpdated = $scope.isSelected = settings.auto_track;
            });
        }

        function isNewDate() {
            return $scope.currectStartDate == null && $scope.settings.syncStartDate
                || $scope.currectStartDate.toString() != $scope.settings.syncStartDate.toString();
        }

        function allowToSync() {
            return $scope.currectStartDate == null
                || new Date($scope.settings.syncStartDate) < new Date($scope.currectStartDate)
        }
    });
