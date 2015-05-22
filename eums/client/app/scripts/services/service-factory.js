'use strict';

angular.module('eums.service-factory', ['gs.to-camel-case', 'gs.to-snake-case'])
    .factory('ServiceFactory', function ($http, $q, toCamelCase, toSnakeCase) {

        var buildArrayProperty = function (object, property, service) {
            var buildPromises = [];
            object[property].forEach(function (objectId) {
                buildPromises.push(service.get(objectId));
            });
            return $q.all(buildPromises).then(function (builtListObjects) {
                builtListObjects.each(function (builtObject, index) {
                    object[property][index] = builtObject;
                });
                return object;
            });
        };

        function attachBuiltPropertiesToObject(objectPropertyBuildPromises, object, buildMap) {
            return $q.all(objectPropertyBuildPromises).then(function (builtObjects) {
                builtObjects.each(function (builtObject, index) {
                    object[Object.keys(buildMap)[index]] = builtObject;
                });
                return object;
            });
        }

        var buildObject = function (object, nestedFields, propertyServiceMap) {
            var objectPropertyBuildPromises = [];
            var arrayPropertyBuildPromises = [];
            var buildMap = nestedFieldsToBuildMap(nestedFields, propertyServiceMap);
            console.log('buildmap', propertyServiceMap);

            Object.each(buildMap, function (property, service) {
                if (Object.isArray(object[property])) {
                    arrayPropertyBuildPromises.push(buildArrayProperty(object, property, service));
                }
                else {
                    object[property] && objectPropertyBuildPromises.push(service.get(object[property]));
                }
            });

            var allObjectPropertiesBuilt = attachBuiltPropertiesToObject(objectPropertyBuildPromises, object, buildMap);

            return $q.all(arrayPropertyBuildPromises).then(function () {
                return allObjectPropertiesBuilt;
            });
        };

        var nestedObjectsToIds = function (object) {
            var objectToFlatten = Object.clone(object);
            return Object.map(objectToFlatten, function (key, value, original) {
                Object.isObject(value) && value.id && (original[key] = value.id);
                return original[key];
            });
        };

        var nestedFieldsToBuildMap = function (fields, buildMap) {
            console.log('fields', fields);
            return fields.reduce(function (previous, current) {
                console.log('service map', buildMap);
                previous[current] = buildMap[current];
                return previous;
            }, {});
        };

        function changeCase(obj, converter) {
            return Object.keys(obj).reduce(function (acc, current) {
                if (Object.isArray(obj[current])) {
                    acc[converter(current)] = obj[current].map(function (element) {
                        return changeCase(element, converter);
                    });
                }
                else if (Object.isObject(obj[current])) {
                    acc[converter(current)] = changeCase(obj[current], converter);
                }
                else {
                    acc[converter(current)] = obj[current];
                }
                return acc;
            }, {});
        }

        return {
            create: function (options) {
                options.changeCase === undefined && (options.changeCase = true);
                var idField = options.idField || 'id';

                var service = {
                    all: function (nestedFields) {
                        return $http.get(options.uri).then(function (response) {
                            var buildPromises = response.data.map(function (flatObject) {
                                return buildObject(flatObject, nestedFields || [], options.propertyServiceMap);
                            });
                            return $q.all(buildPromises).then(function (builtObjects) {
                                return builtObjects.map(function (object) {
                                    var objectToReturn = options.changeCase ? changeCase(object, toCamelCase) : object;
                                    return options.model ? new options.model(objectToReturn) : objectToReturn;
                                });
                            });
                        });
                    },
                    get: function (id, nestedFields) {
                        return $http.get('{1}{2}/'.assign(options.uri, id)).then(function (response) {
                            return buildObject(response.data, nestedFields || [], options.propertyServiceMap).then(function (builtObject) {
                                var objectToReturn = options.changeCase ? changeCase(builtObject, toCamelCase) : builtObject;
                                return options.model ? new options.model(objectToReturn) : objectToReturn;
                            });
                        });
                    },
                    create: function (object) {
                        var flatObject = nestedObjectsToIds(object);
                        var objectToPost = options.changeCase ? changeCase(flatObject, toSnakeCase) : flatObject;
                        return $http.post(options.uri, objectToPost).then(function (response) {
                            return response.data;
                        });
                    },
                    update: function (object, verb) {
                        !verb && (verb = 'PUT');
                        var flatObject = nestedObjectsToIds(object);
                        var objectToPut = options.changeCase ? changeCase(flatObject, toSnakeCase) : flatObject;
                        return $http({
                            method: verb.toUpperCase(),
                            url: '{1}{2}/'.assign(options.uri, object[idField]),
                            data: objectToPut
                        }).then(function (response) {
                            return response.status;
                        });
                    },
                    del: function (object) {
                        return $http.delete('{1}{2}/'.assign(options.uri, object[idField]), object).then(function (response) {
                            return response.status;
                        });
                    }
                };
                options.methods && Object.each(options.methods, function (name, impl) {
                    service[name] = impl;
                });
                return service;
            }
        };
    });

