describe('IP Delivery Report Loss Controller', function () {
    var scope, routeParams, q, mockConsigneeItemService;

    var fetchedConsigneeItems = {results: [{id: 188, item: 88, itemDescription: 'some description', availableBalance: 450}]};

    beforeEach(function () {
        module('DeliveryByIpReportLoss');

        inject(function ($controller, $rootScope, $q) {
            mockConsigneeItemService = jasmine.createSpyObj('ConsigneeItemService', ['filter']);
            mockConsigneeItemService.filter.and.returnValue($q.when(fetchedConsigneeItems));

            scope = $rootScope.$new();
            routeParams = {itemId: 88};

            $controller('DeliveryByIpReportLossController', {
                $scope: scope,
                $routeParams: routeParams,
                ConsigneeItemService: mockConsigneeItemService
            });
        });
    });

    it('should call item service with correct route params and set on scope', function () {
        scope.$apply();
        expect(mockConsigneeItemService.filter).toHaveBeenCalledWith({item: routeParams.itemId});
        expect(scope.consigneeItem.itemId).toBe(88);
        expect(scope.consigneeItem.itemDescription).toBe('some description');
        expect(scope.consigneeItem.quantityAvailable).toBe(450);
    });
});