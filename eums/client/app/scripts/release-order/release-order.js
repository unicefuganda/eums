'use strict';

angular.module('ReleaseOrder', ['eums.config', 'eums.service-factory', 'ReleaseOrderItem', 'SalesOrder', 'Consignee',
    'DistributionPlan'])
    .factory('ReleaseOrderService', function ($http, EumsConfig, ServiceFactory, ReleaseOrderItemService,
                                              SalesOrderService, ConsigneeService, DistributionPlanService) {
        return ServiceFactory.create({
            uri: EumsConfig.BACKEND_URLS.RELEASE_ORDER,
            propertyServiceMap: {
                consignee: ConsigneeService,
                sales_order: SalesOrderService,
                items: ReleaseOrderItemService,
                delivery: DistributionPlanService
            },
            methods: {
                forUser: function (user, nestedFields) {
                    return user.consignee_id ?
                        this.filter({consignee: user.consignee_id}, nestedFields)
                        : this.all(nestedFields);
                }
            }
        });
    });