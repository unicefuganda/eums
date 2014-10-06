describe('DistributionPlanController', function () {

    var scope;
    var location, distPlanEndpointUrl;
    var mockContactService, flowchartService, mockPlanService, mockProgrammeService, mockPlanNodeService;
    var deferred, deferredPlan;

    var stubResponse = {
        data: {
            _id: 'xxxxxxxx',
            firstname: 'Tunji',
            lastname: 'Sunmonu',
            phone: '+256778945363'
        }
    };

    var salesOrderDetails = [
        {'order_number': '00001', 'date': '2014-10-02', 'salesorderitem_set': ['1', '2', '3']}
    ];

    var stubPlanOne = {data: [
        {
            id: 1,
            programme: 1,
            distributionplannode_set: [1, 2]
        }
    ]};


    var stubError = {
        data: {
            error: 'Phone number is not valid'
        }
    };

    beforeEach(function () {
        module('DistributionPlan');
        mockContactService = jasmine.createSpyObj('mockContactService', ['addContact']);
        flowchartService = jasmine.createSpyObj('flowchartService', ['ChartViewModel']);
        mockPlanService = jasmine.createSpyObj('mockPlanService', ['fetchPlans', 'getPlanDetails',
            'createDistributionPlanNode', 'getSalesOrders']);
        mockPlanNodeService = jasmine.createSpyObj('mockPlanNodeService', ['createNode']);
        mockProgrammeService = jasmine.createSpyObj('mockProgrammeService', ['getProgramme']);

        inject(function ($controller, $rootScope, ContactService, $location, $q, $httpBackend, EumsConfig) {
            deferred = $q.defer();
            deferredPlan = $q.defer();
            mockContactService.addContact.and.returnValue(deferred.promise);
            mockProgrammeService.getProgramme.and.returnValue(deferred.promise);
            mockPlanService.fetchPlans.and.returnValue(deferredPlan.promise);
            mockPlanService.getSalesOrders.and.returnValue(deferredPlan.promise);
            mockPlanService.getPlanDetails.and.returnValue(deferredPlan.promise);
            mockPlanNodeService.createNode.and.returnValue(deferredPlan.promise);

            scope = $rootScope.$new();

            location = $location;
            distPlanEndpointUrl = EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN;

            $controller('DistributionPlanController',
                {$scope: scope, ContactService: mockContactService,
                    DistributionPlanService: mockPlanService,
                    DistributionPlanNodeService: mockPlanNodeService,
                    ProgrammeService: mockProgrammeService,
                    $location: location, flowchart: flowchartService});
        });
    });

    it('should know that the programme service is invoked when initialized', function () {
        deferredPlan.resolve(stubPlanOne);
        scope.initialize();
        scope.$apply();
        expect(mockProgrammeService.getProgramme).toHaveBeenCalledWith(1);
    });

    it('should replace program id with programme object when initialized', function () {
        var programme = {id: '1', name: 'Test Programme'};
        deferred.resolve(programme);
        deferredPlan.resolve(stubPlanOne);
        scope.initialize();
        scope.$apply();
        expect(scope.distribution_plans[0].programme).toEqual(programme);
    });


    it('should save contact and return contact with an id', function () {
        deferred.resolve(stubResponse);
        scope.addContact();
        scope.$apply();
        expect(location.path()).toBe('/');
    });

    it('should add an error message to the scope when the contact is NOT saved', function () {
        deferred.reject(stubError);
        scope.addContact();
        scope.$apply();
        expect(scope.errorMessage).toBe('Phone number is not valid');
    });

    it('should know that the plan information is stored in the scope when controller is invoked', function () {
        deferredPlan.resolve(stubPlanOne);
        scope.initialize();
        scope.$apply();
        expect(scope.distribution_plans).toEqual(stubPlanOne.data);
    });

    it('should call the get sales order service from distribution plan', function () {
        scope.initialize();
        expect(mockPlanService.getSalesOrders).toHaveBeenCalled();
    });

    it('should expect all sales orders to be on the local scope when the controller is initialised', function () {
        deferredPlan.resolve({data: salesOrderDetails});
        scope.initialize();
        scope.$apply();
        expect(scope.salesOrders).toEqual(salesOrderDetails);
    });
});