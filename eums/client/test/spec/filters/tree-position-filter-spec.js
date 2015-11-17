describe('Tree position filter', function () {
    var filter, treePositionFilter;
    beforeEach(function () {
        module('EumsFilters');
        inject(function ($filter) {
            filter = $filter;
            treePositionFilter = filter('treePositionFilter');
        });
    });

    it('should return distribution stage name as per tree position', function () {
        expect(treePositionFilter('IMPLEMENTING_PARTNER')).toEqual('IP');
        expect(treePositionFilter('MIDDLE_MAN')).toEqual('Sub-consignee');
        expect(treePositionFilter('END_USER')).toEqual('End user');
    });
});
