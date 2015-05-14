'use strict';

angular.module('Option', ['eums.config', 'eums.service-factory'])
    .factory('OptionService', function($http, EumsConfig, ServiceFactory) {
        return {
            receivedOptions: ServiceFactory.create({uri: EumsConfig.BACKEND_URLS.RECEIVED_OPTIONS}).all,
            qualityOptions: ServiceFactory.create({uri: EumsConfig.BACKEND_URLS.QUALITY_OPTIONS}).all,
            satisfiedOptions: ServiceFactory.create({uri: EumsConfig.BACKEND_URLS.SATISFIED_OPTIONS}).all
        };
    });