'use strict';

angular.module('Item', ['eums.config', 'eums.service-factory'])
    .factory('ItemService', function($http, EumsConfig, ServiceFactory) {
        var ItemUnitService = ServiceFactory({uri: EumsConfig.BACKEND_URLS.ITEM_UNIT});
        return ServiceFactory({uri: EumsConfig.BACKEND_URLS.ITEM, propertyServiceMap: {unit: ItemUnitService}});
    });

