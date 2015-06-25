'use strict';

angular.module('ReleaseOrder', ['eums.config', 'eums.service-factory', 'ReleaseOrderItem', 'SalesOrder', 'Consignee'])
    .factory('ReleaseOrderService', function ($http, EumsConfig, ServiceFactory, ReleaseOrderItemService, SalesOrderService, ConsigneeService) {
        return ServiceFactory.create({
            uri: EumsConfig.BACKEND_URLS.RELEASE_ORDER,
            propertyServiceMap: {
                consignee: ConsigneeService,
                sales_order: SalesOrderService,
                releaseorderitem_set: ReleaseOrderItemService
            },
            methods: {}
        });
    });