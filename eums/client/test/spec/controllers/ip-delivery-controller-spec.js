describe('IP Delivery Controller', function () {
    var mockDeliveryService, scope, location, mockLoaderService, q;

    var firstDelivery = {
        id: 1,
        location: 'Kampala',
        consignee: {id: 10},
        track: true,
        delivery_date: '2015-01-02',
        remark: 'some remarks'
    };
    var secondDelivery = {
        id: 2,
        location: 'Khartoum',
        consignee: {id: 2},
        track: true,
        delivery_date: '2015-03-15',
        remark: 'no remarks'
    };
    var deliveries = [firstDelivery, secondDelivery];
    var emptyFunction = function () {
    };
    var mockModal = {modal: emptyFunction, hasClass: emptyFunction, removeClass: emptyFunction, remove: emptyFunction};
    var viewDeliveryModal = {modal: emptyFunction, hasClass: emptyFunction, removeClass: emptyFunction, remove: emptyFunction};
    var jqueryFake = function (selector) {
        if (selector === '#confirmation-modal') return mockModal;
        else if (selector === '#view-delivery-modal') return viewDeliveryModal;
        else return mockLoaderService;
    };

    beforeEach(function () {
        module('IpDelivery');

        mockDeliveryService = jasmine.createSpyObj('mockDeliveryService', ['all']);

        inject(function ($controller, $rootScope, $location, $q, LoaderService) {
            scope = $rootScope.$new();
            location = $location;
            q = $q;
            mockLoaderService = LoaderService;

            mockDeliveryService.all.and.returnValue($q.when(deliveries));

            spyOn(angular, 'element').and.callFake(jqueryFake);
            spyOn(mockModal, 'modal');
            spyOn(mockLoaderService, 'showLoader');
            spyOn(mockLoaderService, 'hideLoader');

            $controller('IpDeliveryController', {
                $scope: scope,
                DeliveryService: mockDeliveryService,
                LoaderService: mockLoaderService
            });
        });
    });

    describe('on load', function () {
        var deliveriesPromise;
        beforeEach(function () {
            deliveriesPromise = q.defer();
        });

        it('should show loader while loading', function () {
            scope.$apply();

            expect(mockLoaderService.showLoader).toHaveBeenCalled();
            expect(mockLoaderService.showLoader.calls.count()).toBe(1);
        });

        it('should call delivery service and put deliveries on the scope', function () {
            deliveriesPromise.resolve(deliveries);
            scope.$apply();

            expect(mockDeliveryService.all).toHaveBeenCalled();
            expect(scope.deliveries).toBe(deliveries);
            expect(mockLoaderService.hideLoader).toHaveBeenCalled();
            expect(mockLoaderService.hideLoader.calls.count()).toBe(1);
        })
    });
});
