'use strict';

angular.module('Option', ['eums.config'])
    .factory('OptionService', function($http, EumsConfig) {
        return {
            qualityOptions: function() {
                return $http.get(EumsConfig.BACKEND_URLS.QUALITY_OPTIONS).then(function(response) {
                    return response.data;
                });
            }
        };
    });

