'use strict';

angular.module('SystemSettings', ['eums.config', 'User', 'SystemSettingsService', 'Loader',
        'frapontillo.bootstrap-switch', 'ngToast', 'SysUtils'])
    .config(['ngToastProvider', function (ngToast) {
        ngToast.configure({maxNumber: 1, horizontalPosition: 'center'});
    }])
    .controller('SystemSettingsController', function ($rootScope, $scope, $timeout, UserService, SystemSettingsService,
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
        $scope.settings.syncEndDate = null;
        $scope.currectStartDate = null;
        $scope.isAllowSync = false;
        $scope.currentNotificationMessage = '';
        $scope.currentDistrictLabel = '';
        $scope.currentCountryLabel = '';
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

            if (checkSettings()) {
                SystemSettingsService.updateSettings({
                    notification_message: $scope.notificationMessage,
                    district_label: $scope.districtLabel,
                    country_label: $scope.countryLabel
                }).then(function (response) {
                    updateSettings();
                    ngToast.create({content: "Settings saved successfully", class: 'success'});
                });
            } else {
                ngToast.create({content: "Settings not changed", class: 'danger'});
            }
        };

        $scope.cancelMessages = function () {
            resetSettings();
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
            $scope.settings.syncEndDate = $scope.currectEndDate;
        };

        function init() {
            SystemSettingsService.getSettings().then(function (settings) {
                $scope.settings.syncStartDate = settings.sync_start_date ? new Date(settings.sync_start_date) : null;
                $scope.settings.syncEndDate = settings.sync_end_date ? new Date(settings.sync_end_date) : null;
                $scope.currectStartDate = $scope.settings.syncStartDate;
                $scope.currectEndDate = $scope.settings.syncEndDate;
                $scope.notificationMessage = $scope.currentNotificationMessage = settings.notification_message;
                $scope.districtLabel = $scope.currentDistrictLabel = settings.district_label;
                $scope.countryLabel = $scope.currentCountryLabel = settings.country_label;
                $rootScope.countryLabel = $scope.countryLabel ? ' | ' + $scope.countryLabel : $scope.countryLabel;
                isCancelledOrInitUpdated = $scope.isSelected = settings.auto_track;
            });
        }

        $scope.confirmSync = function () {
            LoaderService.hideModal('sync-start-date-confirm-modal');
            $scope.currentStartDate = SysUtilsService.formatDateToYMD($scope.settings.syncStartDate);
            $scope.currentEndDate = SysUtilsService.formatDateToYMD($scope.settings.syncEndDate);
            SystemSettingsService.updateSettings({
                sync_start_date: $scope.currentStartDate,
                sync_end_date: $scope.currentEndDate
            });
        };

        function isNewDate() {
            return $scope.currectStartDate != $scope.settings.syncStartDate ||
                   $scope.currectEndDate != $scope.settings.syncEndDate;
        }

        function allowToSync() {
            return $scope.settings.syncStartDate && $scope.settings.syncEndDate &&
                    new Date($scope.settings.syncStartDate) < new Date($scope.settings.syncEndDate);
        }

        function updateSettings() {
            $scope.currentNotificationMessage = $scope.notificationMessage;
            $scope.currentDistrictLabel = $scope.districtLabel;
            $scope.currentCountryLabel = $scope.countryLabel;
            $rootScope.countryLabel = $scope.countryLabel ? ' | ' + $scope.countryLabel : $scope.countryLabel;
        }

        function resetSettings() {
            $scope.notificationMessage = $scope.currentNotificationMessage;
            $scope.districtLabel = $scope.currentDistrictLabel;
            $scope.countryLabel = $scope.currentCountryLabel;
        }

        function checkSettings() {
            return $scope.notificationMessage != $scope.currentNotificationMessage ||
                $scope.districtLabel != $scope.currentDistrictLabel ||
                $scope.countryLabel != $scope.currentCountryLabel;
        }
    });
