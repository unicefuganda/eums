'use strict';

describe('Module: Home', function () {
    var scope, location;
    beforeEach(module('Home'));

    describe('Controller:Home', function () {
        beforeEach(inject(function ($controller, $rootScope, $location) {
            location = $location;
            scope = $rootScope.$new();
            $controller('HomeController', {
                $scope: scope});
        }));

        it('should redirect to detailed responses page', function () {
            scope.data = {disctrict: 'Gulu'};
            scope.showDetailedResponses(scope.allResponses);
            scope.$apply();
            expect(location.path()).toEqual('/response-details/' + scope.data.district);
        });
    });

    describe('Controller:Response', function () {
        var params, mockDistributionPlanService, deferred;

        var stubResponse = {
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
            location: 'Gulu'
        };

        module(function ($provide) {
            $provide.value('DistributionPlanService', mockDistributionPlanService);
        });


        beforeEach(inject(function ($controller, $rootScope, $q) {
            mockDistributionPlanService = jasmine.createSpyObj('mockDistributionPlanService', ['orderAllResponsesByDate']);
            params = {district: 'Gulu'};
            deferred = $q.defer();
            scope = $rootScope.$new();
            mockDistributionPlanService.orderAllResponsesByDate.and.returnValue(deferred.promise);
            $controller('ResponseController', {
                $scope: scope, $routeParams: params, DistributionPlanService: mockDistributionPlanService});
        }));

        it('should have params object with district', function () {
            deferred.resolve(stubResponse);

            scope.$apply();
            expect(scope.allResponses).toEqual(stubResponse);
        });
    });
});
