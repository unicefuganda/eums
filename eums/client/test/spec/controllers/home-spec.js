'use strict';

describe('Module: Home', function () {
    var scope, q, location;
    beforeEach(module('Home'));

    describe('Controller:Home', function () {
        var mockUserService, deferred;

        beforeEach(inject(function ($controller, $rootScope, $location, $q) {
            location = $location;
            scope = $rootScope.$new();
            mockUserService = jasmine.createSpyObj('mockUserService', ['getCurrentUser']);
            deferred = $q.defer();
            mockUserService.getCurrentUser.and.returnValue(deferred.promise);
            $controller('HomeController', {
                $scope: scope, UserService: mockUserService});
        }));

        it('should redirect to detailed responses page', function () {
            scope.data = {disctrict: 'Gulu'};
            scope.showDetailedResponses(scope.allResponses);
            scope.$apply();
            expect(location.path()).toEqual('/response-details/' + scope.data.district);
        });
    });

    describe('Controller:Response', function () {
        var params, mockDistributionPlanService, mockDistributionPlanNodeService, mockSalesOrderItemService;
        var deferredDistributionPlanPromise, deferredDistributionPlanNodePromise, deferredSalesOrderItemPromise;

        var stubResponse = [{
            node: 3,
            amountSent: 100,
            amountReceived: '50',
            consignee: {
                id: 10,
                name: 'PADER DHO'
            }, productReceived: 'No',
            item: 'Safety box f.used syrgs/ndls 5lt/BOX-25',
            qualityOfProduct: 'Good',
            informedOfDelay: 'No',
            dateOfReceipt: '6/10/2014',
            programme: {
                id: 3,
                name: 'YI107 - PCR 3 KEEP MY CHILDREN SAFE'
            },
            location: 'Gulu',
            purchase_order: {
                id: 1,
                order_number: 25565
            },
            contact_person:{
                firstName: 'John',
                secondName: 'Doe',
                phone: '+234778945674'
            }
        }];

        var stubNodeDetails = {
            id: 1,
            parent: null,
            distribution_plan: 1,
            location: 'Kampala',
            children: [2],
            consignee: {},
            contact_person_id: 1,
            contact_person: {firstName: 'Bob'}

        };

        var stubPOItemForSOItemDetails = {
            purchase_order: {
                id: 2,
                order_number: 25567
            }
        };

        module(function ($provide) {
            $provide.value('DistributionPlanService', mockDistributionPlanService);
        });


        beforeEach(inject(function ($controller, $rootScope, $q) {
            q = $q;
            mockDistributionPlanService = jasmine.createSpyObj('mockDistributionPlanService', ['orderAllResponsesByDate']);
            mockDistributionPlanNodeService = jasmine.createSpyObj('mockDistributionPlanNodeService', ['getPlanNodeDetails']);
            mockSalesOrderItemService = jasmine.createSpyObj('mockSalesOrderItemService', ['getPOItemforSOItem']);
            params = {district: 'Gulu'};
            deferredDistributionPlanPromise = $q.defer();
            deferredDistributionPlanNodePromise = $q.defer();
            deferredSalesOrderItemPromise = $q.defer();
            scope = $rootScope.$new();
            mockDistributionPlanService.orderAllResponsesByDate.and.returnValue(deferredDistributionPlanPromise.promise);
            mockDistributionPlanNodeService.getPlanNodeDetails.and.returnValue(deferredDistributionPlanNodePromise.promise);
            mockSalesOrderItemService.getPOItemforSOItem.and.returnValue(deferredSalesOrderItemPromise.promise);
            $controller('ResponseController', {
                $scope: scope,
                $routeParams: params,
                DistributionPlanService: mockDistributionPlanService,
                DistributionPlanNodeService: mockDistributionPlanNodeService,
                SalesOrderItemService: mockSalesOrderItemService});
        }));

        it('should have params object with district', function () {
            deferredDistributionPlanPromise.resolve(stubResponse);
            deferredDistributionPlanNodePromise.resolve(stubNodeDetails);
            deferredSalesOrderItemPromise.resolve(stubPOItemForSOItemDetails);

            scope.$apply();
            expect(scope.allResponses).toEqual(stubResponse);
        });
    });
});
