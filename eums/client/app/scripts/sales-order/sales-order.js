'use strict';

angular.module('SalesOrder', ['eums.config', 'Programme', 'SalesOrderItem', 'DistributionPlanNode', 'eums.service-factory'])
    .factory('SalesOrderService', function ($http, EumsConfig, ProgrammeService, SalesOrderItemService, DistributionPlanNodeService, ServiceFactory) {
        var serviceOptions = {
            uri: EumsConfig.BACKEND_URLS.SALES_ORDER,
            propertyServiceMap: {
                programme: ProgrammeService,
                salesorderitem_set: SalesOrderItemService,
                distributionplannode_set: DistributionPlanNodeService
            },
            methods: {
                forDirectDelivery: function () {
                    return filterSalesOrders.call(this, 'true');
                },
                forWarehouseDelivery: function () {
                    return filterSalesOrders.call(this, 'false');
                }
            }
        };

        function filterSalesOrders(hasReleaseOrders, nestedFields) {
            var url = EumsConfig.BACKEND_URLS.SALES_ORDER + '?has_release_orders=' + hasReleaseOrders;
            return $http.get(url).then(function (response) {
                return ServiceFactory.buildListResponse(response, this, nestedFields, serviceOptions);
            }.bind(this));
        }

        return ServiceFactory.create(serviceOptions);
    });