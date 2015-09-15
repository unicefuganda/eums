describe('AlertsController', function () {

    var scope;
    var mockAlertsService, mockLoaderService, mockToast, q;
    var type = 'delivery';
    var deferredAlerts,
        expectedAlerts = [
            {
                "order_type": "Waybill",
                "order_number": 123456,
                "issue": "not_received",
                "is_resolved": false,
                "remarks": null,
                "consignee_name": "Some Consignee Name",
                "contact_name": "Some Contact Name",
                "created_on": "2015-08-28",
                "issue_display_name": "Not Received",
                "item_description": "Some Description"
            },
            {
                "order_type": "Purchase Order",
                "order_number": 654321,
                "issue": "bad_condition",
                "is_resolved": false,
                "remarks": null,
                "consignee_name": "Wakiso DHO",
                "contact_name": "John Doe",
                "created_on": "2015-08-28",
                "issue_display_name": "In Bad Condition",
                "item_description": null
            },
        ],
        alertsResponses = {
            "count": 4, "previous": null, "results": [
                {
                    "order_type": "Waybill",
                    "order_number": 123456,
                    "issue": "not_received",
                    "is_resolved": false,
                    "remarks": null,
                    "consignee_name": "Some Consignee Name",
                    "contact_name": "Some Contact Name",
                    "created_on": "2015-08-28",
                    "issue_display_name": "Not Received",
                    "item_description": "Some Description"
                },
                {
                    "order_type": "Purchase Order",
                    "order_number": 654321,
                    "issue": "bad_condition",
                    "is_resolved": false,
                    "remarks": null,
                    "consignee_name": "Wakiso DHO",
                    "contact_name": "John Doe",
                    "created_on": "2015-08-28",
                    "issue_display_name": "In Bad Condition",
                    "item_description": null
                }
            ], "pageSize": 2, "next": "http://localhost:8000/api/alert/?page=2&paginate=true"
        };


    beforeEach(function () {
        module('Alerts');

        mockAlertsService = jasmine.createSpyObj('mockAlertsService', ['all', 'update', 'get']);
        mockLoaderService = jasmine.createSpyObj('mockLoaderService', ['showLoader', 'hideLoader', 'showModal']);

        inject(function ($controller, $rootScope, $q, ngToast) {

            q = $q;
            deferredAlerts = $q.defer();
            deferredAlerts.resolve(alertsResponses);
            mockAlertsService.all.and.returnValue(deferredAlerts.promise);
            mockAlertsService.get.and.returnValue($q.when({'total': 4, 'unresolved': 2}));

            mockAlertsService.update.and.returnValue($q.when({}));
            mockToast = ngToast;
            spyOn(mockToast, 'create');

            scope = $rootScope.$new();

            $controller('AlertsController', {
                $scope: scope,
                AlertsService: mockAlertsService,
                LoaderService: mockLoaderService,
                ngToast: mockToast
            });
        });
    });

    it('should set delivery alerts on scope from result of service call', function () {
        scope.$apply();
        expect(mockAlertsService.all).toHaveBeenCalledWith([], {type: type, paginate: 'true', page: 1});
        expect(scope.alerts).toEqual(expectedAlerts);
        expect(mockLoaderService.showLoader).toHaveBeenCalled();
        expect(mockLoaderService.hideLoader).toHaveBeenCalled();
    });

    it('should set item alerts on scope when type is changed to item', function () {
        var item_type = 'item';
        scope.changeAlertType(item_type);
        scope.$apply();
        expect(mockAlertsService.all).toHaveBeenCalledWith([], {type: item_type, paginate: 'true', page: 1});
        expect(mockLoaderService.showLoader).toHaveBeenCalled();
        expect(mockLoaderService.hideLoader).toHaveBeenCalled();
    });

    it('should fetch new page when pageChanged is called and put the consignees on that page on scope', function () {
        scope.goToPage(10);
        scope.$apply();
        expect(mockAlertsService.all).toHaveBeenCalledWith([], {type: type, paginate: 'true', page: 10});
        expect(scope.alerts).toEqual(expectedAlerts);
        expect(mockLoaderService.showLoader).toHaveBeenCalled();
        expect(mockLoaderService.hideLoader).toHaveBeenCalled();
    });

    it('should check whether alert type is the active type', function() {
       scope.$apply();
        expect(scope.isActiveAlertType('delivery')).toBeTruthy();
        expect(scope.isActiveAlertType('item')).toBeFalsy();

        scope.type = 'item';
        expect(scope.isActiveAlertType('delivery')).toBeFalsy();
        expect(scope.isActiveAlertType('item')).toBeTruthy();
    });

    describe('Resolve Alerts ', function () {
        it('should call the update with remarks and alert id', function () {
            var alertId = 1;
            scope.$apply();

            var remarks = 'some remarks about an alert';
            scope.resolveAlert(alertId, remarks);
            scope.$apply();

            expect(mockAlertsService.update).toHaveBeenCalledWith({id: alertId, remarks: remarks}, 'PATCH');
        });

        it('should update unresolved alerts count upon updating an alert', function () {
            var alertId = 1;
            scope.$apply();

            scope.resolveAlert(alertId, 'some remarks about an alert');
            scope.$apply();

            expect(mockAlertsService.get).toHaveBeenCalledWith('count');
            expect(scope.unresolvedAlertsCount).toEqual(2);
        });

        it('should load all alerts upon updating an alert', function () {
            var alertId = 1;
            scope.$apply();

            scope.resolveAlert(alertId, 'some remarks about an alert');
            scope.$apply();

            expect(mockAlertsService.all).toHaveBeenCalledWith([], {type: type, paginate: 'true', page: 1});
            expect(mockAlertsService.all.calls.count()).toEqual(2);
        });

        it('should not load alerts upon failure to update an alert and create toast', function () {
            mockAlertsService.update.and.returnValue(q.reject());
            scope.$apply();

            scope.remarks = 'some remarks about an alert';
            scope.resolveAlert();
            scope.$apply();

            expect(mockAlertsService.all.calls.count()).toEqual(1);
            expect(mockToast.create).toHaveBeenCalledWith({content: 'Failed to resolve alert', class: 'danger'});
        });

        it('should set modal flag to true when add remark button is clicked', function () {
            scope.addRemark(0);
            scope.$apply();

            expect(mockLoaderService.showModal).toHaveBeenCalledWith('resolve-alert-modal-0');
        });

        it('should set modal flag to true when show remark button is clicked', function () {
            scope.showRemark(1);
            scope.$apply();

            expect(mockLoaderService.showModal).toHaveBeenCalledWith('resolved-alert-modal-1');
        });
    });

});