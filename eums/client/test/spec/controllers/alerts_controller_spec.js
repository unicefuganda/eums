describe('AlertsController', function () {

    var scope;
    var mockAlertsService, mockLoaderService;
    var deferredAlerts,
        expectedAlerts = [
            {"order_type": "Waybill", "order_number": 123456, "issue": "not_received", "is_resolved": false, "remarks": null, "consignee_name": "Some Consignee Name", "contact_name": "Some Contact Name", "created_on": "2015-08-28", "issue_display_name": "Not Received", "item_description": "Some Description"},
            {"order_type": "Purchase Order", "order_number": 654321, "issue": "bad_condition", "is_resolved": false, "remarks": null, "consignee_name": "Wakiso DHO", "contact_name": "John Doe", "created_on": "2015-08-28", "issue_display_name": "In Bad Condition", "item_description": null},
        ],
        alertsResponses = {"count": 4, "previous": null, "results": [
            {"order_type": "Waybill", "order_number": 123456, "issue": "not_received", "is_resolved": false, "remarks": null, "consignee_name": "Some Consignee Name", "contact_name": "Some Contact Name", "created_on": "2015-08-28", "issue_display_name": "Not Received", "item_description": "Some Description"},
            {"order_type": "Purchase Order", "order_number": 654321, "issue": "bad_condition", "is_resolved": false, "remarks": null, "consignee_name": "Wakiso DHO", "contact_name": "John Doe", "created_on": "2015-08-28", "issue_display_name": "In Bad Condition", "item_description": null}
        ], "pageSize": 2, "next": "http://localhost:8000/api/alert/?page=2&paginate=true"};


    beforeEach(function () {
        module('Alerts');

        mockAlertsService = jasmine.createSpyObj('mockAlertsService', ['all']);
        mockLoaderService = jasmine.createSpyObj('mockLoaderService', ['showLoader', 'hideLoader']);

        inject(function ($controller, $rootScope, $q, ngToast) {

            deferredAlerts = $q.defer();
            deferredAlerts.resolve(alertsResponses);
            mockAlertsService.all.and.returnValue(deferredAlerts.promise);

            scope = $rootScope.$new();

            $controller('AlertsController', {
                $scope: scope,
                AlertsService: mockAlertsService,
                LoaderService: mockLoaderService,
                ngToast: ngToast
            });
        });
    });

    it('should set alerts on scope from result of service call', function () {
        scope.$apply();
        expect(mockAlertsService.all).toHaveBeenCalledWith([], {paginate: 'true', page: 1});
        expect(scope.alerts).toEqual(expectedAlerts);
        expect(mockLoaderService.showLoader).toHaveBeenCalled();
        expect(mockLoaderService.hideLoader).toHaveBeenCalled();
    });

    it('should fetch new page when pageChanged is called and put the consignees on that page on scope', function () {
        scope.goToPage(10);
        scope.$apply();
        expect(mockAlertsService.all).toHaveBeenCalledWith([], {paginate: 'true', page: 10});
        expect(scope.alerts).toEqual(expectedAlerts);
        expect(mockLoaderService.showLoader).toHaveBeenCalled();
        expect(mockLoaderService.hideLoader).toHaveBeenCalled();
    });

});