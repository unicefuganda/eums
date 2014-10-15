'use strict';

angular.module('eums.ip', ['eums.config'])
    .factory('IPService', function (EumsConfig, $http, $q) {
        return {
            loadAllDistricts: function () {
                return $http.get(EumsConfig.DISTRICTJSONURL, {cache: true});
            },
            getAllIps: function () {
                return $http.get(EumsConfig.IPJSONURL, {cache: true});
            },
            groupIPsByDistrict: function (district) {
                return this.getAllIps().then(function (ips) {
                    return ips.data.filter(function (ip) {
                        return ip.City.toLowerCase() === district.toLowerCase();
                    });
                });
            },
            groupAllIPsByDistrict: function () {
                var self = this;
                return self.loadAllDistricts().then(function (response) {
                    var groups = response.data.map(function (district) {
                        return self.groupIPsByDistrict(district);
                    });

                    return $q.all(groups);
                });
            }
        };
    });