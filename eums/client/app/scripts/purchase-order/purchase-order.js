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
                forDirectDelivery: function (nestedFields, urlArgs) {
                    var directDeliveryUrl = 'for_direct_delivery/';
                    //var uri = urlArgs ? directDeliveryUrl + this.queryStringFrom(urlArgs) : directDeliveryUrl;
                    return this._listEndpointMethod(directDeliveryUrl, nestedFields);
                },
                forUser: function (user, nestedFields) {
                    return user.consignee_id ?
                        this.filter({consignee: user.consignee_id}, nestedFields)
                        : this._listEndpointMethod('for_direct_delivery/', nestedFields);
                },
                fetchDeliveries: function(purchaseOrder) {
                    return this.getDetail(purchaseOrder, 'deliveries');
                }
            }
        });
    });