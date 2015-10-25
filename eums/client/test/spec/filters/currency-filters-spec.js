describe('EUMS currency filters', function() {

    beforeEach(module('eums.currencyFilters'));

    describe('compactCurrencyFilter', function() {

        it('should return back number when not in thousands or millions',
            inject(function(compactCurrencyFilter) {
                expect(compactCurrencyFilter(567.88)).toBe('$568');
            })
        );

        it('should return back number in abbreviated thousands with round up',
            inject(function(compactCurrencyFilter) {
                expect(compactCurrencyFilter(5893.66)).toBe('$5.9k');
            })
        );

        it('should return back number in abbreviated thousands with round down',
            inject(function(compactCurrencyFilter) {
                expect(compactCurrencyFilter(15843.66)).toBe('$15.8k');
            })
        );

        it('should return back number in abbreviated thousands with round down',
            inject(function(compactCurrencyFilter) {
                expect(compactCurrencyFilter(44860988.43)).toBe('$44.9m');
            })
        );

        it('should return back number in abbreviated millions with round down',
            inject(function(compactCurrencyFilter) {
                expect(compactCurrencyFilter(9840988.43)).toBe('$9.8m');
            })
        );

        it('should return back $0.00 when amount is undefined',
            inject(function(compactCurrencyFilter) {
                expect(compactCurrencyFilter(undefined)).toBe('$0');
            })
        );
    });

    describe('compactNumberFilter', function() {

        it('should return back two decimal places for smaller numbers',
            inject(function(compactNumberFilter) {
                expect(compactNumberFilter(678.60)).toBe('679');
            })
        );

        it('should return back 0.00 when amount is undefined',
            inject(function(compactNumberFilter) {
                expect(compactNumberFilter(undefined)).toBe('0');
            })
        );
    });
});