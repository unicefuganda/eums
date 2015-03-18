(function () {
    describe('Manual Reporting', function () {
        beforeEach(module('ManualReporting'));

        describe('when documentFilter', function () {
            var filter, documents;
            beforeEach(inject(function ($filter) {
                filter = $filter;
                documents = [
                    {
                        order_number: '1234',
                        'date': '2014-10-06',
                        'programme': 'Midwife Supplies'
                    },
                    {
                        order_number: '6234',
                        'date': '2014-12-06',
                        'programme': 'Vehicles'
                    },
                    {
                        order_number: '00006',
                        'date': '2014-11-06',
                        'programme': 'Nets'
                    }
                ];
            }));

            it('should filter by sales order number', function () {
                expect(filter('documentFilter')(documents, '1234')).toEqual([documents[0]]);
            });

            it('should filter by sales date', function () {
                expect(filter('documentFilter')(documents, '2014-12-06')).toEqual([documents[1]]);
            });

            it('should filter by programme', function () {
                expect(filter('documentFilter')(documents, 'Nets')).toEqual([documents[2]]);
            });

            it('should partially filter by order number', function () {
                expect(filter('documentFilter')(documents, '23')).toEqual([documents[0], documents[1]]);
            });

            it('should not have any result if no result found', function () {
                expect(filter('documentFilter')(documents, 'Random')).toEqual([]);
            });
        });
    });
})();
