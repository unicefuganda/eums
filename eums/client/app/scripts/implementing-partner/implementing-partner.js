'use strict';

angular.module('eums.ip', ['eums.config'])
    .factory('IPService', function (EumsConfig, $http) {
        return {
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
            mapIPToGeometry: function(IPS){
                return IPS.map(function(ip){
                    ip.geometry = '';
                });
            }
        };
    });