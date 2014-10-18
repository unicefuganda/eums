'use strict';

describe('Controller: Home', function() {
    beforeEach(module('Home'));

    var scope, mockReportService, getReportsPromise;
    var stubReports = [
        {'id': 1, 'program_code': 'STEP'}
    ];
    var expectedStats = {received: 6, notReceived: 5, distributed: 4, notDistributed: 2};

    beforeEach(inject(function($controller, $rootScope) {
        mockReportService = jasmine.createSpyObj('mockReportService', ['getReports', 'getTotals']);

        inject(function($controller, $q) {
            scope = $rootScope.$new();

            getReportsPromise = $q.defer();

            getReportsPromise.resolve(stubReports);

            mockReportService.getReports.and.returnValue(getReportsPromise.promise);


            $controller('HomeController', {$scope: scope, DistributionReportService: mockReportService});
        });
    }));

    it('should get reports from reports service and keep them', function() {
        scope.$apply();
        expect(mockReportService.getReports).toHaveBeenCalled();
    });

    it('should get total global stats on load and put them on scope', function() {
        mockReportService.getTotals.and.returnValue(expectedStats);
        scope.$apply();
        expect(scope.totalStats).toEqual(expectedStats);
    });

    it('should update totalStats on scope when update stats is called', function() {
        var filterOptions = {consignee: 1, programme: 2};
        mockReportService.getTotals.and.returnValue(expectedStats);
        scope.$apply();

        scope.updateTotalStats(filterOptions);

        expect(mockReportService.getTotals).toHaveBeenCalledWith(stubReports, filterOptions);
        expect(scope.totalStats).toEqual(expectedStats);
    });
});
