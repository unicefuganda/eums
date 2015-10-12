'use strict';

angular.module('Programme', ['eums.config', 'eums.service-factory'])
    .factory('ProgrammeService', function ($http, EumsConfig, ServiceFactory) {
        return ServiceFactory.create({
            uri: EumsConfig.BACKEND_URLS.PROGRAMME,
            methods: {
                programmesWithIps: function (nestedFields) {
                    return this._listEndpointMethod('with-ips/', nestedFields);
                }
            }
        });
    });