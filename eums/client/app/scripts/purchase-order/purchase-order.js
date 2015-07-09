'use strict';

angular.module('PurchaseOrder', ['eums.config', 'SalesOrder', 'PurchaseOrderItem', 'eums.service-factory'])
    .factory('PurchaseOrderService', function ($http, EumsConfig, SalesOrderService, PurchaseOrderItemService, ServiceFactory) {
        return ServiceFactory.create({
            uri: EumsConfig.BACKEND_URLS.PURCHASE_ORDER,
            propertyServiceMap: {
                sales_order: SalesOrderService,
                purchaseorderitem_set: PurchaseOrderItemService
            },
            methods: {
                forDirectDelivery: function (nestedFields) {
                    return this._listEndpointMethod('for_direct_delivery/', nestedFields);
                },
                forUser: function (user, nestedFields) {
                    return user.consignee_id ?
                        this.filter({consignee: user.consignee_id}, nestedFields)
                        : this._listEndpointMethod('for_direct_delivery/', nestedFields);
                },
                getConsigneePurchaseOrder: function (id, consigneeId) {
                    return $http.get(EumsConfig.BACKEND_URLS.PURCHASE_ORDER + id).then(function (response) {
                        var order = response.data;
                        return SalesOrderService.get(order.sales_order, ['programme']).then(function (sales_order) {
                            order.sales_order = sales_order;
                            return $http.get(EumsConfig.BACKEND_URLS.CONSIGNEE_PURCHASE_ORDER_ITEMS + consigneeId + '/purchase-order/' + id).then(function (response) {
                                order.purchaseorderitem_set = response.data;
                                return order;
                            });
                        });
                    });
                },
                getConsigneePurchaseOrderNode: function (consigneeId, salesOrderItemId) {
                    return $http.get(EumsConfig.BACKEND_URLS.CONSIGNEE_PURCHASE_ORDER_ITEMS + consigneeId + '/sales-order-item/' + salesOrderItemId).then(function (response) {
                        return response.data;
                    });
                }
            }
        });
    });