describe('Purchase Order Filter', function () {
    beforeEach(module('DistributionPlan'));

    describe('when called', function () {
        var filter, purchaseOrders;
        beforeEach(inject(function ($filter) {
            filter = $filter;
            purchaseOrders = [
                {
                    order_number: '1234',
                    'date': '2014-10-06',
                    'description': 'Midwife Supplies',
                    'purchaseorderitem_set': [1, 2]
                },
                {
                    order_number: '6234',
                    'date': '2014-12-06',
                    'description': 'Vehicles',
                    'purchaseorderitem_set': [1, 2]
                },
                {
                    order_number: '00006',
                    'date': '2014-11-06',
                    'description': 'Nets',
                    'purchaseorderitem_set': [1, 2]
                }
            ];
        }));

        it('should filter by purchase order number', function () {
            expect(filter('purchaseOrderFilter')(purchaseOrders, '1234')).toEqual([purchaseOrders[0]]);
        });

        it('should filter by purchase date', function () {
            expect(filter('purchaseOrderFilter')(purchaseOrders, '2014-12-06')).toEqual([purchaseOrders[1]]);
        });
        
        it('should partially filter by order number', function () {
            expect(filter('purchaseOrderFilter')(purchaseOrders, '23')).toEqual([purchaseOrders[0], purchaseOrders[1]]);
        });

        it('should not have any result if no result found', function () {
            expect(filter('purchaseOrderFilter')(purchaseOrders, 'Random')).toEqual([]);
        });
    });
});
