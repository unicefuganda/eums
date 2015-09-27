'use strict';

angular.module('ConsigneeItem', ['eums.config', 'eums.service-factory', 'Item'])
    .factory('ConsigneeItemService', function (EumsConfig, ServiceFactory, ItemService) {
        return ServiceFactory.create({
            uri: EumsConfig.BACKEND_URLS.CONSIGNEE_ITEM,
            propertyServiceMap: {item: ItemService}
        });
    });


