describe('DistributionPlanController', function () {

    var scope;
    var location, sce, distPlanEndpointUrl;
    var mockContactService, mockPlanService;
    var deferred, deferredPlan;

    var stubResponse = {
        data: {
            _id: 'xxxxxxxx',
            firstname: 'Tunji',
            lastname: 'Sunmonu',
            phone: '+256778945363'
        }
    };

    var stubPlanOne = {data: {
        id: 1,
        programme: 1,
        distributionplannode_set: [1, 2]
    }};

    var stubPlanTwo = {nodes: [{
        id: 1,
        programme: 1,
        distributionplannode_set: [1, 2],
        lineItems: [],
        consignee: {name: 'Test'}
    }]};

    var stubError = {
        data: {
            error: 'Phone number is not valid'
        }
    };

    beforeEach(function () {
        module('DistributionPlan');
        mockContactService = jasmine.createSpyObj('mockContactService', ['addContact']);
        mockPlanService = jasmine.createSpyObj('mockPlanService', ['fetchPlans', 'getPlanDetails']);
        sce = jasmine.createSpyObj('sce', ['trustAsHtml']);

        inject(function ($controller, $rootScope, ContactService, $location, $q, $httpBackend, EumsConfig) {
            deferred = $q.defer();
            deferredPlan = $q.defer();
            mockContactService.addContact.and.returnValue(deferred.promise);
            mockPlanService.fetchPlans.and.returnValue(deferredPlan.promise);
            mockPlanService.getPlanDetails.and.returnValue(deferredPlan.promise);

            scope = $rootScope.$new();
            location = $location;
            distPlanEndpointUrl = EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN;

            $controller('DistributionPlanController',
                        {$scope: scope, ContactService: mockContactService,
                            DistributionPlanService: mockPlanService,
                            $location: location, $sce: sce});
        });
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

    it('should know how to get the distribution plan details for a particular plan id', function () {
        deferredPlan.resolve(stubPlanTwo);
        scope.showDistributionPlan('1');
        scope.$apply();
        expect(scope.distribution_plan_details).toEqual({nodes: stubPlanTwo.nodes, lineItems: stubPlanTwo.nodes[0].lineItems});
    });

    it('should know call the trustAsHtml function with the right node details', function () {
        var expectedHtml = '<div class="node" id="nodeDetail1">Test</div>';
        scope.distribution_plan_details = {nodes: stubPlanTwo.nodes, lineItems: stubPlanTwo.nodes[0].lineItems};
        scope.renderHtml();
        scope.$apply();
        expect(sce.trustAsHtml).toHaveBeenCalledWith(expectedHtml);
    });

    it('should know how to construct the nodes html to be rendered on the view pages', function () {
        var expectedHtml = '<div class="node" id="nodeDetail1">Test</div>';
        sce.trustAsHtml.and.returnValue(expectedHtml);
        scope.distribution_plan_details = {nodes: stubPlanTwo.nodes, lineItems: stubPlanTwo.nodes[0].lineItems};
        scope.renderHtml();
        scope.$apply();
        expect(scope.htmlToAppend).toEqual(expectedHtml);
    });
});