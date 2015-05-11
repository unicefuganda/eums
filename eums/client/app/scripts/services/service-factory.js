'use strict';

angular.module('GenericService', []).factory('ServiceFactory', function ($http, $q) {
    var buildObject = function (object, buildMap) {
        var buildOutPromises = [];
        Object.each(buildMap, function (property, service) {
            buildOutPromises.push(service.get(object[property]))
        });
        return $q.all(buildOutPromises).then(function (builtObjects) {
            builtObjects.each(function (builtObject, index) {
                object[Object.keys(buildMap)[index]] = builtObject;
            });
            return object;
        });
    };

    return function (options) {
        return {
            all: function (opts) {
                !opts && (opts = {build: {}});
                return $http.get(options.uri).then(function (response) {
                    var buildPromises = response.data.map(function (flatObject) {
                        return buildObject(flatObject, opts.build);
                    });
                    return $q.all(buildPromises).then(function (builtObjects) {
                        return builtObjects.map(function (object) {
                            return object;
                        });
                    });
                });
            },
            get: function (id) {
                return $http.get('{1}{2}/'.assign(options.uri, id)).then(function (response) {
                    return response.data;
                });
            },
            create: function (object) {
                return $http.post(options.uri, object).then(function (response) {
                    return response.data;
                });
            },
            update: function (object) {
                return $http.put('{1}{2}/'.assign(options.uri, object.id), object).then(function (response) {
                    return response.status;
                });
            },
            del: function (object) {
                return $http.delete('{1}{2}/'.assign(options.uri, object.id), object).then(function (response) {
                    return response.status;
                });
            }
        };
    };
});

