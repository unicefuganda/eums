describe('Purchase Order Item Model', function () {
    var PurchaseOrderItemModel;
    var itemJson = {
        id: 1, purchaseOrder: 10, quantity: 100, availableBalance: 50,
        value: 11, salesOrderItem: 12, item: 89, distributionplannodeSet: [1, 2]
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
        expect(purchaseOrderItem.availableBalance).toEqual(0);
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
        expect(purchaseOrderItem.availableBalance).toEqual(50);
        expect(purchaseOrderItem.value).toEqual(11);
        expect(purchaseOrderItem.salesOrderItem).toEqual(12);
        expect(purchaseOrderItem.item).toEqual(89);
        expect(purchaseOrderItem.distributionplannodeSet).toEqual([1, 2]);
    });

    it('should calculate quantity left from a list of delivery nodes filtering out NaNs', function () {
        var purchaseOrderItem = new PurchaseOrderItemModel(itemJson);
        var nodes = [{targetedQuantity: 10}, {targetedQuantity: 30}, {targetedQuantity: NaN}];
        expect(purchaseOrderItem.quantityLeft(nodes)).toBe(60);
    });

    it('should calculate delivery value based on quantity to be shipped', function() {
        var attrs = {quantity: 100, availableBalance: 50, value: 1200.00};
        var purchaseOrderItem = new PurchaseOrderItemModel(attrs);
        expect(purchaseOrderItem.deliveryValue(50)).toBe('600.00');
    });

    it('should calculate delivery value based on quantity to be shipped with decimals', function() {
        var attrs = {quantity: 100, availableBalance: 37, value: 1222.00};
        var purchaseOrderItem = new PurchaseOrderItemModel(attrs);
        expect(purchaseOrderItem.deliveryValue(37)).toBe('452.14');
    });

    it('should zero delivery value when quantity to be shipped is zero', function() {
        var attrs = {quantity: 100, availableBalance: 37, value: 1222.00};
        var purchaseOrderItem = new PurchaseOrderItemModel(attrs);
        expect(purchaseOrderItem.deliveryValue(0)).toBe('0.00');
    });

    it('should be invalid if quantityShipped is greater than availableBalance', function() {
        var attrs = {availableBalance: 37};
        var purchaseOrderItem = new PurchaseOrderItemModel(attrs);
        expect(purchaseOrderItem.isInvalid(100)).toBe(true);
    });

    it('should be valid if quantityShipped is less or equal to availableBalance', function() {
        var attrs = {availableBalance: 37};
        var purchaseOrderItem = new PurchaseOrderItemModel(attrs);

        expect(purchaseOrderItem.isInvalid(20)).toBeFalsy();

        expect(purchaseOrderItem.isInvalid(37)).toBeFalsy();
    });
});
