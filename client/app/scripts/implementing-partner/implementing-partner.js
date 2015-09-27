'use strict';

angular.module('eums.ip', ['eums.config'])
    .factory('IPService', function (EumsConfig, $http) {
        return {
            loadAllDistricts: function () {
                return $http.get(EumsConfig.DISTRICTJSONURL, {cache: true});
            }
        };
    });