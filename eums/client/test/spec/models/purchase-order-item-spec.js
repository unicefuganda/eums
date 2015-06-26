describe('Purchase Order Item Model', function () {
    var PurchaseOrderItemModel;
    var itemJson = {
        id: 1, purchaseOrder: 10, quantity: 100, value: 11, salesOrderItem: 12,
        item: 89, distributionplannodeSet: [1, 2]
    };

    beforeEach(function () {
        module('PurchaseOrder');
        inject(function (PurchaseOrderItem) {
            PurchaseOrderItemModel = PurchaseOrderItem;
        });
    });

    it('should construct empty object if nothing is passed to constructor', function () {
        var purchaseOrderItem = new PurchaseOrderItemModel();
        expect(purchaseOrderItem.id).toBeUndefined();
        expect(purchaseOrderItem.purchaseOrder).toBeUndefined();
        expect(purchaseOrderItem.quantity).toEqual(0);
        expect(purchaseOrderItem.value).toEqual(0);
        expect(purchaseOrderItem.salesOrderItem).toBeUndefined();
        expect(purchaseOrderItem.item).toBeUndefined();
        expect(purchaseOrderItem.distributionplannodeSet).toEqual([]);
    });

    it('should construct item from json', function () {
        var purchaseOrderItem = new PurchaseOrderItemModel(itemJson);
        expect(purchaseOrderItem.id).toBe(1);
        expect(purchaseOrderItem.purchaseOrder).toBe(10);
        expect(purchaseOrderItem.quantity).toEqual(100);
        expect(purchaseOrderItem.value).toEqual(11);
        expect(purchaseOrderItem.salesOrderItem).toEqual(12);
        expect(purchaseOrderItem.item).toEqual(89);
        expect(purchaseOrderItem.distributionplannodeSet).toEqual([1, 2]);
    });

    //TODO Move this to Delivery Node Model test
    xit('should calculate quantity left from a list of delivery nodes filtering out NaNs', function () {
        var purchaseOrderItem = new PurchaseOrderItemModel(itemJson);
        var nodes = [{targetedQuantity: 10}, {targetedQuantity: 30}, {targetedQuantity: NaN}];
        expect(purchaseOrderItem.quantityLeft(nodes)).toBe(60);
    });
});
