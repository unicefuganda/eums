'use strict';

angular.module('Option', ['eums.config'])
    .factory('OptionService', function($http, EumsConfig) {
        return {
            receivedOptions: function() {
                return $http.get(EumsConfig.BACKEND_URLS.RECEIVED_OPTIONS).then(function(response) {
                    return response.data;
                });
            },
            qualityOptions: function() {
                return $http.get(EumsConfig.BACKEND_URLS.QUALITY_OPTIONS).then(function(response) {
                    return response.data;
                });
            },
            satisfiedOptions: function() {
                return $http.get(EumsConfig.BACKEND_URLS.SATISFIED_OPTIONS).then(function(response) {
                    return response.data;
                });
            }
        };
    });

