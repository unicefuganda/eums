describe('IP Delivery Report Loss Controller', function () {
    var scope, routeParams, q, mockItemService;

    beforeEach(function () {
        module('DeliveryByIpReportLoss');

        inject(function ($controller, $rootScope, $q) {
            mockItemService = jasmine.createSpyObj('ItemService', ['get']);
            mockItemService.get.and.returnValue($q.when('some item'));

            scope = $rootScope.$new();
            routeParams = {itemId: 88};

            $controller('DeliveryByIpReportLossController', {
                $scope: scope,
                $routeParams: routeParams,
                ItemService: mockItemService
            });
        });
    });

    it('should call item service with correct route params and set on scope', function () {
        scope.$apply();
        expect(mockItemService.get).toHaveBeenCalledWith(88);
        expect(scope.item).toBe('some item');
    });
});