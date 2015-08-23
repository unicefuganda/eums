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
                $scope: scope, UserService: mockUserService
            });
        }));

        it('should redirect to detailed responses page', function () {
            scope.data = {disctrict: 'Gulu'};
            scope.showDetailedResponses(scope.allResponses);
            scope.$apply();
            expect(location.path()).toEqual('/response-details/' + scope.data.district);
        });
    });

    describe('Controller:Response', function () {
        var params, mockDeliveryService, mockDeliveryNodeService, mockPurchaseOrderItemService,
            mockPurchaseOrderService;
        var deferredDistributionPlanPromise, deferredDeliveryNodePromise, deferredPurchaseOrderItemPromise,
            deferredPurchaseOrder;

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
            contact_person: {
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

        var stubPurchaseOrder = {
            id: 2,
            order_number: 25567
        };

        var stubPurchaseOrderItem = {
            purchase_order: stubPurchaseOrder.id
        };

        module(function ($provide) {
            $provide.value('DeliveryService', mockDeliveryService);
        });

        beforeEach(inject(function ($controller, $rootScope, $q) {
            q = $q;
            mockDeliveryService = jasmine.createSpyObj('mockDeliveryService', ['orderAllResponsesByDate']);
            mockDeliveryNodeService = jasmine.createSpyObj('mockDeliveryNodeService', ['get']);
            mockPurchaseOrderItemService = jasmine.createSpyObj('mockPurchaseOrderItemService', ['get']);
            mockPurchaseOrderService = jasmine.createSpyObj('mockPurchaseOrderService', ['get']);
            params = {district: 'Gulu'};
            deferredDistributionPlanPromise = $q.defer();
            deferredDeliveryNodePromise = $q.defer();
            deferredPurchaseOrderItemPromise = $q.defer();
            deferredPurchaseOrder = $q.defer();
            scope = $rootScope.$new();
            mockDeliveryService.orderAllResponsesByDate.and.returnValue(deferredDistributionPlanPromise.promise);
            mockDeliveryNodeService.get.and.returnValue(deferredDeliveryNodePromise.promise);
            mockPurchaseOrderItemService.get.and.returnValue(deferredPurchaseOrderItemPromise.promise);
            mockPurchaseOrderService.get.and.returnValue(deferredPurchaseOrder.promise);
            $controller('ResponseController', {
                $scope: scope,
                $routeParams: params,
                DeliveryService: mockDeliveryService,
                DeliveryNodeService: mockDeliveryNodeService,
                PurchaseOrderItemService: mockPurchaseOrderItemService,
                PurchaseOrderService: mockPurchaseOrderService
            });
        }));

        it('should have params object with district', function () {
            deferredDistributionPlanPromise.resolve(stubResponse);
            deferredDeliveryNodePromise.resolve(stubNodeDetails);
            deferredPurchaseOrderItemPromise.resolve(stubPurchaseOrderItem);
            deferredPurchaseOrder.resolve(stubPurchaseOrder);

            scope.$apply();
            expect(scope.allResponses).toEqual(stubResponse);
        });
    });
});
