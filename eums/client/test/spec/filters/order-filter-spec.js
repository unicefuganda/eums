describe('Order Filter', function () {
    beforeEach(module('EumsFilters'));

    describe('when called', function () {
        var filter, purchaseOrders;
        beforeEach(inject(function ($filter) {
            filter = $filter;
            purchaseOrders = [
                {
                    id: 1,
                    orderNumber: '1234',
                    date: '2014-10-06',
                    description: 'Midwife Supplies',
                    purchaseorderitem_set: [1, 2]
                },
                {
                    id: 2,
                    orderNumber: '6234',
                    date: '2014-12-06',
                    description: 'Vehicles',
                    purchaseorderitem_set: [1, 2]
                },
                {
                    id: 3,
                    orderNumber: '00006',
                    date: '2014-11-06',
                    description: 'Nets',
                    purchaseorderitem_set: [1, 2]
                }
            ];
        }));

        it('should filter by purchase order number', function () {
            expect(filter('orderFilter')(purchaseOrders, '1234', undefined, ['orderNumber', 'date'])).toEqual([purchaseOrders[0]]);
        });

        it('should filter by purchase date', function () {
            expect(filter('orderFilter')(purchaseOrders, undefined, '2014-12-06', ['orderNumber', 'date'])).toEqual([purchaseOrders[1]]);
        });

        it('should partially filter by order number', function () {
            expect(filter('orderFilter')(purchaseOrders, '23', undefined, ['orderNumber', 'date'])).toEqual([purchaseOrders[0], purchaseOrders[1]]);
        });

        it('should not have any result if no result found', function () {
            expect(filter('orderFilter')(purchaseOrders, 'Random', undefined, ['orderNumber', 'date'])).toEqual([]);
        });
    });

    describe('when orderFilter', function () {
        var filter, orderItems, searchFields = ['orderNumber', 'date'];//, 'programme'];;
        beforeEach(inject(function ($filter) {
            filter = $filter;
            orderItems = [
                {
                    id: 1,
                    orderNumber: '1234',
                    date: '2014-10-06',
                    programme: 'Midwife Supplies'
                },
                {
                    id: 2,
                    orderNumber: '6234',
                    date: '2014-12-06',
                    programme: 'Vehicles'
                },
                {
                    id: 3,
                    orderNumber: '00006',
                    date: '2014-11-06',
                    programme: 'Nets'
                }
            ];
        }));

        it('should filter by sales order number', function () {
            expect(filter('orderFilter')(orderItems, '1234', undefined, searchFields)).toEqual([orderItems[0]]);
        });

        it('should filter by sales date', function () {
            expect(filter('orderFilter')(orderItems, undefined, '2014-12-06', searchFields)).toEqual([orderItems[1]]);
        });

        // it('should filter by programme', function () {
        //    expect(filter('orderFilter')(orderItems, 'Nets', undefined, searchFields)).toEqual([orderItems[2]]);
        // });

        it('should partially filter by order number', function () {
            expect(filter('orderFilter')(orderItems, '23', undefined, searchFields)).toEqual([orderItems[0], orderItems[1]]);
        });

        it('should not have any result if no result found', function () {
            expect(filter('orderFilter')(orderItems, 'Random', undefined, searchFields)).toEqual([]);
        });
    });
});
