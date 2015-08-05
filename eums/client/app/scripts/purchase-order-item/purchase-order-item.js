'use strict';

angular.module('PurchaseOrderItem', ['eums.config', 'eums.service-factory', 'Item'])
    .factory('PurchaseOrderItem', function () {
        return function (json) {
            !json && (json = {});

            this.id = json.id;
            this.purchaseOrder = json.purchaseOrder;
            this.itemNumber = json.itemNumber;
            this.quantity = json.quantity || 0;
            this.availableBalance = json.availableBalance || 0;
            this.value = json.value || 0;
            this.salesOrderItem = json.salesOrderItem;
            this.item = json.item;
            this.distributionplannodeSet = json.distributionplannodeSet || [];

            this.quantityLeft = function (deliveryNodes) {
                return this.quantity - deliveryNodes.sum(function (node) {
                        return !isNaN(node.quantityIn) ? node.quantityIn : 0;
                    });
            }.bind(this);

            this.deliveryValue = function (quantityShipped) {
                var unitValue = this.value / this.quantity;
                return (unitValue * quantityShipped).toFixed(2);
            }.bind(this);

            this.isInvalid = function (quantityShipped) {
                return quantityShipped > this.availableBalance;
            }.bind(this);
        };
    })
    .factory('PurchaseOrderItemService', function (EumsConfig, ServiceFactory, $q,ItemService, PurchaseOrderItem) {
        return ServiceFactory.create({
            uri: EumsConfig.BACKEND_URLS.PURCHASE_ORDER_ITEM,
            propertyServiceMap: {item: ItemService},
            model: PurchaseOrderItem
        });
    });