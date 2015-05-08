'use strict';

angular.module('GenericService', []).factory('ServiceFactory', function ($http, $q) {
    return function (options) {
        return {
            all: function () {
                return $http.get(options.uri);
            },
            get: function (id) {
                return $http.get(options.uri + id + '/');
            },
            create: function (object) {
                return $http.post(options.uri, object);
            },
            update: function (object) {
                return $http.put(options.uri + object.id + '/', object);
            },
            del: function (object) {
                return $http.delete(options.uri + object.id + '/', object);
            }
        };
    };
});

