'use strict';

angular.module('eums.ip', ['eums.config'])
    .factory('IPService', function (EumsConfig, $http) {
        return {
            getAllIps: function () {
                return $http.get(EumsConfig.IPJSONURL, {cache: true});
            }
        };
    });