describe('ResponsesController', function () {
    var mockResponsesService;

    var deferred, deferredResponsesPromise;
    var scope, q, location;
    var consigneeId = 1;

    var salesOrderItemId = 1;
    var stubResponses = {'node': 'consignee 1',
        'children': [
            {'node': 'consignee 3',
                'children': [],
                'answers': {
                    'productReceived': 'UNCATEGORISED'}},
            {'node': 'consignee 2',
                'children': [
                    {
                        'node': 'consignee 4',
                        'children': [],
                        'answers': {
                            'AmountReceived': '80'}}
                ],
                'answers': {'productReceived': 'UNCATEGORISED'}}
        ],
        'answers': {'AmountReceived': '80'}};

    beforeEach(function () {
        module('Responses');

        mockResponsesService = jasmine.createSpyObj('mockResponsesService', ['fetchResponses']);

        inject(function($controller, $q, $rootScope, $location) {
            q = $q;
            deferred = $q.defer();
            deferredResponsesPromise = $q.defer();
            mockResponsesService.fetchResponses.and.returnValue(deferredResponsesPromise.promise);

            location = $location;
            scope = $rootScope.$new();

            $controller('ResponsesController', {
                $scope: scope,
                $location: location,
                ResponsesService: mockResponsesService
            });
        });
    });

    describe('when a sales order item is selected, responses are fetched and displayed in the page', function () {
        xit('should fetch responses for a plan that matches for a sales order line item and consignee', function () {
            scope.consigneeId = consigneeId;
            scope.salesOrderItemId = salesOrderItemId;
            deferredResponsesPromise.resolve(stubResponses);
            scope.$apply();

            expect(scope.responses).toEqual(stubResponses);
        });
    });
});
