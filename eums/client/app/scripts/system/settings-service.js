'use strict';

angular.module('SystemSettingsService', ['eums.config'])
    .factory('SystemSettingsService', function ($http, $q, $timeout, EumsConfig) {
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
