'use strict';

angular.module('SystemSettingsService', ['eums.config'])
    .factory('SystemSettingsService', function ($http, $q, EumsConfig) {
        return {
            getSettings: function () {
                var result = $q.defer();
                $http.get(EumsConfig.BACKEND_URLS.SYSTEM_SETTINGS).then(function (response) {
                    result.resolve(response.data[0]);
                }, function () {
                    result.reject();
                });
                return result.promise;
            },
            getSettingsWithDefault: function () {
                return this.getSettings().then(function (result) {
                    if (!result.district_label) {
                        result.district_label = "My-District-3";
                    }
                    return result;
                });
            },
            updateSettings: function (data) {
                var result = $q.defer();
                $http.put(EumsConfig.BACKEND_URLS.SYSTEM_SETTINGS + '/1', data).then(function (response) {
                    result.resolve(response.data);
                }, function () {
                    result.reject();
                });
                return result.promise;
            }
        }
    });
