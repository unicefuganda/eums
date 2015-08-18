'use strict';

angular.module('ConsigneeItem', ['eums.config', 'eums.service-factory'])
    .factory('ConsigneeItemService', function ($http, EumsConfig, ServiceFactory, Item) {
        return ServiceFactory.create({
            uri: EumsConfig.BACKEND_URLS.ITEM,
            propertyServiceMap: {unit: ItemUnitService},
            model: Item
        });
    });

