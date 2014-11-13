describe('Sales Order', function () {
    beforeEach(module('DistributionPlan'));

    describe('when salesOrderFilter', function () {
        var filter, salesOrders;
        beforeEach(inject(function ($filter) {
            filter = $filter;
            salesOrders = [
                {
                    order_number: '1234',
                    'date': '2014-10-06',
                    'description': 'Midwife Supplies',
                    'salesorderitem_set': [1, 2]
                },
                {
                    order_number: '6234',
                    'date': '2014-12-06',
                    'description': 'Vehicles',
                    'salesorderitem_set': [1, 2]
                },
                {
                    order_number: '00006',
                    'date': '2014-11-06',
                    'description': 'Nets',
                    'salesorderitem_set': [1, 2]
                }
            ];
        }));

        it('should filter by sales order number', function () {
            expect(filter('salesOrderFilter')(salesOrders, '1234')).toEqual([salesOrders[0]]);
        });

        it('should filter by sales date', function () {
            expect(filter('salesOrderFilter')(salesOrders, '2014-12-06')).toEqual([salesOrders[1]]);
        });

        it('should filter by description', function () {
            expect(filter('salesOrderFilter')(salesOrders, 'Nets')).toEqual([salesOrders[2]]);
        });

        it('should partially filter by order number', function () {
            expect(filter('salesOrderFilter')(salesOrders, '23')).toEqual([salesOrders[0], salesOrders[1]]);
        });

        it('should not have any result if no result found', function () {
            expect(filter('salesOrderFilter')(salesOrders, 'Random')).toEqual([]);
        });
    });
});
