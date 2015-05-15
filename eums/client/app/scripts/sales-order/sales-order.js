'use strict';

angular.module('SalesOrder', ['eums.config', 'Programme', 'eums.service-factory'])
    .factory('SalesOrderService', function ($http, EumsConfig, ProgrammeService, ServiceFactory) {
        return ServiceFactory.create({
            uri: EumsConfig.BACKEND_URLS.SALES_ORDER,
            propertyServiceMap: {programme: ProgrammeService}
        });
    });