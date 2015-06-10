'use strict';

angular.module('SalesOrder', ['eums.config', 'Programme', 'SalesOrderItem', 'DistributionPlanNode', 'eums.service-factory'])
    .factory('SalesOrderService', function ($http, EumsConfig, ProgrammeService, SalesOrderItemService, DistributionPlanNodeService, ServiceFactory) {
        function filterSalesOrders(hasReleaseOrders) {
            return $http.get(EumsConfig.BACKEND_URLS.SALES_ORDER + '?has_release_orders=' + hasReleaseOrders).then(function (response) {
                return response.data;
            });
        }

        return ServiceFactory.create({
            uri: EumsConfig.BACKEND_URLS.SALES_ORDER,
            propertyServiceMap: {
                programme: ProgrammeService,
                salesorderitem_set: SalesOrderItemService,
                distributionplannode_set: DistributionPlanNodeService
            },
            methods: {
                forDirectDelivery: function () {
                    return filterSalesOrders('true');
                },
                forWarehouseDelivery: function () {
                    return filterSalesOrders('false');
                }
            }
        });
    });