'use strict';

angular.module('GenericService', []).factory('ServiceFactory', function ($http, $q) {
    return function (options) {
        return {
            all: function () {
                return $http.get(options.uri).then(function (response) {
                    return response.data;
                });
            },
            get: function (id) {
                return $http.get(options.uri + id + '/').then(function (response) {
                    return response.data;
                });
            },
            create: function (object) {
                return $http.post(options.uri, object).then(function (response) {
                    return response.data;
                })
            },
            update: function (object) {
                return $http.put(options.uri + object.id + '/', object).then(function (response) {
                    return response;
                });
            }
        };
    };
});

