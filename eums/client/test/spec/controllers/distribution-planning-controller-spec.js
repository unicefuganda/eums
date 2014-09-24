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

    var stubPlanTwo = {name: 'Plan 2',
        id: 1,
        programme: 1,
        distributionplannode_set: [1, 2],
        nodeTree: {
            id: 1,
            children: [],
            lineItems: [],
            distribution_plan: 1,
            consignee: {name: 'Test'}
        }};

    var stubPlanNoNodeList = {name: 'Plan 2',
        id: 1,
        programme: 1,
        distributionplannode_set: [1, 2],
        nodeList: []};

    var stubPlanThree = {name: 'Plan 3',
        id: 1,
        programme: 1,
        distributionplannode_set: [1, 2],
        nodeTree: {
            id: 1,
            children: [
                {id: 2,
                    children: [
                        {id: 4,
                            children: [],
                            lineItems: [],
                            distribution_plan: 1,
                            consignee: {name: 'Consignee 4'}}
                    ],
                    lineItems: [],
                    distribution_plan: 1,
                    consignee: {name: 'Consignee 2'}},
                {id: 3,
                    children: [],
                    lineItems: [],
                    distribution_plan: 1,
                    consignee: {name: 'Consignee 3'}}
            ],
            lineItems: [],
            distribution_plan: 1,
            consignee: {name: 'Test'}
        }};

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
        expect(scope.distribution_plan_details).toEqual({nodeTree: stubPlanTwo.nodeTree, lineItems: stubPlanTwo.nodeTree.lineItems});
    });

    it('should know distribution plan details are empty if there is no node elements', function () {
        deferredPlan.resolve(stubPlanNoNodeList);
        scope.showDistributionPlan('1');
        scope.$apply();
        expect(scope.distribution_plan_details).toEqual([]);
    });

    it('should know call the trustAsHtml function with the right node details', function () {
        var expectedHtml = '<div class="node" id="nodeDetail1">Test</div>';
        scope.distribution_plan_details = {nodeTree: stubPlanTwo.nodeTree, lineItems: stubPlanTwo.nodeTree.lineItems};
        scope.renderHtml();
        scope.$apply();
        expect(sce.trustAsHtml).toHaveBeenCalledWith(expectedHtml);
    });

    it('should know how to construct the nodes html to be rendered on the view pages', function () {
        var expectedHtml = '<div class="node" id="nodeDetail1">Test</div>';
        sce.trustAsHtml.and.returnValue(expectedHtml);
        scope.distribution_plan_details = {nodeTree: stubPlanTwo.nodeTree, lineItems: stubPlanTwo.nodeTree.lineItems};
        scope.renderHtml();
        scope.$apply();
        expect(scope.htmlToAppend).toEqual(expectedHtml);
    });

    it('should know how to construct the nodes html to be rendered on the view pages when children nodes are present', function () {
        var expectedHtml = '<div class="node" id="nodeDetail1">Test</div>' +
            '<div class="node" id="nodeDetail2">Test</div>' +
            '<div class="node" id="nodeDetail4">Test</div>'+
            '<div class="node" id="nodeDetail3">Test</div>';

        sce.trustAsHtml.and.returnValue(expectedHtml);
        scope.distribution_plan_details = {nodeTree: stubPlanThree.nodeTree, lineItems: stubPlanThree.nodeTree.lineItems};
        scope.renderHtml();
        scope.$apply();
        expect(scope.htmlToAppend).toEqual(expectedHtml);
    });
});