'use strict';

describe('Controller: Home', function () {
    beforeEach(module('Home'));

    var scope, mockReportService, consigneeResponsesPromise, mockDistributionPlanService;
    var stubConsigneeResponses = [
        {
            'node': 13,
            'item': 'IEHK2006,kit,suppl.1-drugs',
            'productReceived': 'Yes',
            'consignee': {
                'id': 21,
                'name': 'BUNDIBUGYO DHO'
            },
            'amountReceived': '20',
            'amountSent': 1,
            'satisfiedWithProduct': 'No',
            'programme': {
                'id': 4,
                'name': 'YI105 - PCR 1 KEEP CHILDREN AND MOTHERS'
            }
        },
        {
            'node': 16,
            'item': 'IEHK2006,kit,suppl.1-drugs',
            'productReceived': 'No',
            'informedOfDelay': 'Yes',
            'consignee': {
                'id': 5,
                'name': 'WAKISO DHO'
            },
            'amountReceived': '30',
            'amountSent': 1,
            'programme': {
                'id': 4,
                'name': 'YI105 - PCR 1 KEEP CHILDREN AND MOTHERS'
            }
        },
        {
            'node': 17,
            'item': 'IEHK2006,kit,suppl.1-drugs',
            'qualityOfProduct': 'Good',
            'consignee': {
                'id': 19,
                'name': 'MUBENDE DHO'
            },
            'productReceived': 'Yes',
            'amountSent': 1,
            'satisfiedWithProduct': 'Yes',
            'programme': {
                'id': 4,
                'name': 'YI105 - PCR 1 KEEP CHILDREN AND MOTHERS'
            }
        }
    ];

    beforeEach(inject(function ($controller, $rootScope) {
        mockReportService = jasmine.createSpyObj('mockReportService', ['getReports', 'getTotals']);
        mockDistributionPlanService = jasmine.createSpyObj('mockDistributionPlanService', ['getAllConsigneeResponses']);

        inject(function ($controller, $q) {
            scope = $rootScope.$new();

            consigneeResponsesPromise = $q.defer();
            consigneeResponsesPromise.resolve({data: stubConsigneeResponses});

            mockDistributionPlanService.getAllConsigneeResponses.and.returnValue(consigneeResponsesPromise.promise);


            $controller('HomeController', {$scope: scope, DistributionPlanService: mockDistributionPlanService});
        });
    }));

    it('should get all consignees response and keep them', function () {
        scope.$apply();
        expect(mockDistributionPlanService.getAllConsigneeResponses).toHaveBeenCalled();
    });

    it('should get total global stats on load and put them on scope', function () {
        scope.$apply();
        var totalStats = { received: 50, notReceived: 0, distributed: 3, notDistributed: -47 };
        expect(scope.totalStats).toEqual(totalStats);
    });

    it('should update totalStats on scope when update stats is called', function () {
        var totalFilteredStats = { received: 20, notReceived: 0, distributed: 1, notDistributed: -19 };
        var filterOptions = {consignee: 21, programme: 4};
        scope.$apply();

        scope.updateTotalStats(filterOptions);

        expect(scope.totalStats).toEqual(totalFilteredStats);
    });
});
