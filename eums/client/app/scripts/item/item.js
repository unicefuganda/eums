'use strict';

angular.module('Item', ['eums.config', 'eums.service-factory'])
    .factory('Item', function () {
        return function (json) {
            !json && (json = {});
            this.id = json.id || '';
            this.description = json.description || '';
            this.unit = json.unit || {name: 'Each'};
        };
    }).factory('ItemService', function ($http, EumsConfig, ServiceFactory, Item) {
        var ItemUnitService = ServiceFactory.create({uri: EumsConfig.BACKEND_URLS.ITEM_UNIT});
        return ServiceFactory.create({
            uri: EumsConfig.BACKEND_URLS.ITEM,
            propertyServiceMap: {unit: ItemUnitService},
            model: Item
        });
    });

