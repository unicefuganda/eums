'use strict';

angular.module('PurchaseOrderItem', ['eums.config', 'SalesOrderItem', 'eums.service-factory'])
    .factory('PurchaseOrderItemService', function ($http, $q, EumsConfig, SalesOrderItemService, ServiceFactory) {
        return ServiceFactory.create({
            uri: EumsConfig.BACKEND_URLS.PURCHASE_ORDER_ITEM,
            propertyServiceMap: {sales_order_item: SalesOrderItemService}
        });
    });