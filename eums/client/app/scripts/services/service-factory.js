'use strict';

angular.module('GenericService', ['gs.to-camel-case', 'gs.to-snake-case']).factory('ServiceFactory', function ($http, $q, toCamelCase) {
    var serviceOptions;

    var buildObject = function (object, nestedFields) {
        var buildOutPromises = [];
        var buildMap = nestedFieldsToBuildMap(nestedFields);

        Object.each(buildMap, function (property, service) {
            buildOutPromises.push(service.get(object[property]));
        });

        return $q.all(buildOutPromises).then(function (builtObjects) {
            builtObjects.each(function (builtObject, index) {
                object[Object.keys(buildMap)[index]] = builtObject;
            });
            return object;
        });
    };

    var nestedObjectsToIds = function (object) {
        var objectToFlatten = Object.clone(object);
        return Object.map(objectToFlatten, function (key, value, original) {
            if (typeof value === 'object' && value.id) {
                original[key] = value.id;
            }
            return original[key];
        });
    };

    var nestedFieldsToBuildMap = function (fields) {
        return fields.reduce(function (previous, current) {
            previous[current] = serviceOptions.propertyServiceMap[current];
            return previous;
        }, {});
    };

    function changeCase(obj, converter) {
        return Object.keys(obj).reduce(function (acc, current) {
            acc[converter(current)] = obj[current];
            return acc;
        }, {});
    }

    return function (options) {
        serviceOptions = options;
        return {
            all: function (nestedFields) {
                return $http.get(options.uri).then(function (response) {
                    var buildPromises = response.data.map(function (flatObject) {
                        return buildObject(flatObject, nestedFields || []);
                    });
                    return $q.all(buildPromises).then(function (builtObjects) {
                        return builtObjects.map(function (object) {
                            return object;
                        });
                    });
                });
            },
            get: function (id, nestedFields) {
                return $http.get('{1}{2}/'.assign(options.uri, id)).then(function (response) {
                    return buildObject(response.data, nestedFields || []).then(function (builtObject) {
                        return changeCase(builtObject, toCamelCase);
                    });
                });
            },
            create: function (object) {
                return $http.post(options.uri, object).then(function (response) {
                    return response.data;
                });
            },
            update: function (object) {
                var flatObject = nestedObjectsToIds(object);
                return $http.put('{1}{2}/'.assign(options.uri, object.id), flatObject).then(function (response) {
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

