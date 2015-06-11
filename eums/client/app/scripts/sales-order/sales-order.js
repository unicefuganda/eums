'use strict';

angular.module('SalesOrder', ['eums.config', 'Programme', 'SalesOrderItem', 'DistributionPlanNode', 'eums.service-factory'])
    .factory('SalesOrderService', function ($http, EumsConfig, ProgrammeService, SalesOrderItemService, DistributionPlanNodeService, ServiceFactory) {
        return ServiceFactory.create({
            uri: EumsConfig.BACKEND_URLS.SALES_ORDER,
            propertyServiceMap: {
                programme: ProgrammeService,
                salesorderitem_set: SalesOrderItemService,
                distributionplannode_set: DistributionPlanNodeService
            },
            methods: {
                forDirectDelivery: function () {
                    return this.filter({has_release_orders: 'false'});
                },
                forWarehouseDelivery: function () {
                    return this.filter({has_release_orders: 'true'});
                }
            }
        });
    });