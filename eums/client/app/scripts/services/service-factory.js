'use strict';

angular.module('eums.service-factory', ['gs.to-camel-case', 'gs.to-snake-case'])
    .factory('ServiceFactory', function ($http, $q, toCamelCase, toSnakeCase) {

        var buildArrayProperty = function (object, property, fetchParams) {
            var buildPromises = [];
            object[property].forEach(function (objectId) {
                buildPromises.push(fetchParams.service.get(objectId, fetchParams.deepFields));
            }.bind(this));
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
            var buildMap = nestedFieldsToBuildMap.call(this, nestedFields, propertyServiceMap);

            Object.each(buildMap, function (property, fetchParams) {
                if (Object.isArray(object[property])) {
                    arrayPropertyBuildPromises.push(buildArrayProperty.call(this, object, property, fetchParams));
                }
                else {
                    object[property] && objectPropertyBuildPromises.push(fetchParams.service.get(object[property], fetchParams.deepFields));
                }
            }.bind(this));

            var allObjectPropertiesBuilt = attachBuiltPropertiesToObject(objectPropertyBuildPromises, object, buildMap);

            return $q.all(arrayPropertyBuildPromises).then(function () {
                return allObjectPropertiesBuilt;
            });
        };

        var nestedObjectsToIds = function (object) {
            var objectToFlatten = Object.merge({}, object);
            return Object.map(objectToFlatten, function (key, value, original) {
                value && value.id && (original[key] = value.id);
                return original[key];
            });
        };

        var nestedFieldsToBuildMap = function (fields, buildMap) {
            return fields.reduce(function (map, current) {
                var fieldNames = current.split('.');
                var immediateFieldName = fieldNames.shift();
                var deepFields = fieldNames.length ? deepFieldNamesToArray(fieldNames) : [];
                var service = buildMap[immediateFieldName] === 'self' ? this : buildMap[immediateFieldName];
                map[immediateFieldName] = {service: service, deepFields: deepFields};
                return map;
            }.bind(this), {});
        };

        var deepFieldNamesToArray = function (fieldsArray) {
            var fieldNamesString = fieldsArray.reduce(function (acc, current) {
                return acc.length ? acc + '.' + current : current;
            }, '');
            return [fieldNamesString];
        };

        function changeCase(obj, converter) {
            return Object.keys(obj).reduce(function (acc, current) {
                if (Object.isArray(obj[current])) {
                    acc[converter(current)] = obj[current].map(function (element) {
                        if (typeof element === 'object') {
                            return changeCase(element, converter);
                        }
                        return element;
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

        function buildListResponse(response, nestedFields, options) {
            var buildPromises = response.data.map(function (flatObject) {
                return buildObject.call(this, flatObject, nestedFields || [], options.propertyServiceMap);
            }.bind(this));
            return $q.all(buildPromises).then(function (builtObjects) {
                return builtObjects.map(function (object) {
                    var objectToReturn = options.changeCase ? changeCase(object, toCamelCase) : object;
                    return options.model ? new options.model(objectToReturn) : objectToReturn;
                });
            });
        }

        function queryStringFrom(filterParams) {
            var queryString = '?';
            Object.each(filterParams, function (key, value) {
                queryString += key + '=' + value + '&';
            });
            return queryString.to(queryString.length - 1);
        }

        function getObject(uri, options, nestedFields) {
            return $http.get(uri).then(function (response) {
                return buildObject.call(this, response.data, nestedFields || [], options.propertyServiceMap).then(function (builtObject) {
                    var objectToReturn = options.changeCase ? changeCase(builtObject, toCamelCase) : builtObject;
                    return options.model ? new options.model(objectToReturn) : objectToReturn;
                });
            }.bind(this));
        }

        return {
            create: function (options) {
                options.changeCase === undefined && (options.changeCase = true);
                var idField = options.idField || 'id';

                var service = {
                    all: function (nestedFields) {
                        return $http.get(options.uri).then(function (response) {
                            return buildListResponse.call(this, response, nestedFields, options);
                        }.bind(this));
                    },
                    get: function (id, nestedFields) {
                        var uri = '{1}{2}/'.assign(options.uri, id);
                        return getObject.call(this, uri, options, nestedFields);
                    },
                    getDetail: function (object, detailRouteName, nestedFields) {
                        var uri = '{1}{2}/{3}'.assign(options.uri, object.id, detailRouteName);
                        var opts = Object.merge({model: undefined}, options.model);
                        return getObject.call(this, uri, opts, nestedFields);
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
                        return this._del(object);
                    },
                    filter: function (filterParams, nestedFields) {
                        return $http.get(options.uri + queryStringFrom(filterParams)).then(function (response) {
                            return buildListResponse.call(this, response, nestedFields, options);
                        }.bind(this));
                    },
                    _del: function (object) {
                        return $http.delete('{1}{2}/'.assign(options.uri, object[idField]), object).then(function (response) {
                            return response.status;
                        });
                    },
                    _listEndpointMethod: function (url, nestedFields) {
                        return $http.get(options.uri + url).then(function (response) {
                            return buildListResponse.call(this, response, nestedFields, options);
                        }.bind(this));
                    }
                };
                options.methods && Object.each(options.methods, function (name, impl) {
                    service[name] = impl.bind(service);
                });
                return service;
            }
        };
    });
