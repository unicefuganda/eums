describe('AlertsController', function () {

    var scope, deferred;
    var mockAlertsService, mockLoaderService, mockToast, q, mockDeliveryService, mockUserService, mockSortService, mockSortArrowService;
    var userHasPermissionToPromise, deferredPermissionsResultsPromise;
    var type = 'delivery';
    var deferredAlerts,
        expectedAlerts = [
            {
                "orderType": "Waybill",
                "orderNumber": 123456,
                "issue": "not_received",
                "isResolved": false,
                "remarks": null,
                "consigneeName": "Some Consignee Name",
                "contactName": "Some Contact Name",
                "createdOn": "2015-08-28",
                "issueDisplayName": "Not Received",
                "itemDescription": "Some Description",
                "runnableId": 10,
                "isRetriggered": false
            },
            {
                "orderType": "Purchase Order",
                "orderNumber": 654321,
                "issue": "bad_condition",
                "isResolved": false,
                "remarks": null,
                "consigneeName": "Wakiso DHO",
                "contactName": "John Doe",
                "createdOn": "2015-08-28",
                "issueDisplayName": "In Bad Condition",
                "itemDescription": null,
                "runnableId": 11,
                "isRetriggered": false
            },
            {
                "orderType": "Waybill",
                "orderNumber": 567890,
                "issue": "not_received",
                "isResolved": true,
                "remarks": null,
                "consigneeName": "Some Consignee Name",
                "contactName": "Some Contact Name",
                "createdOn": "2015-08-28",
                "issueDisplayName": "Not Received",
                "itemDescription": "Some Description",
                "runnableId": 12,
                "isRetriggered": false
            }
        ],
        alertsResponses = {
            "count": 4, "previous": null, "results": [
                {
                    "orderType": "Waybill",
                    "orderNumber": 123456,
                    "issue": "not_received",
                    "isResolved": false,
                    "remarks": null,
                    "consigneeName": "Some Consignee Name",
                    "contactName": "Some Contact Name",
                    "createdOn": "2015-08-28",
                    "issueDisplayName": "Not Received",
                    "itemDescription": "Some Description",
                    "runnableId": 10,
                    "isRetriggered": false
                },
                {
                    "orderType": "Purchase Order",
                    "orderNumber": 654321,
                    "issue": "bad_condition",
                    "isResolved": false,
                    "remarks": null,
                    "consigneeName": "Wakiso DHO",
                    "contactName": "John Doe",
                    "createdOn": "2015-08-28",
                    "issueDisplayName": "In Bad Condition",
                    "itemDescription": null,
                    "runnableId": 11,
                    "isRetriggered": false
                },
                {
                    "orderType": "Waybill",
                    "orderNumber": 567890,
                    "issue": "not_received",
                    "isResolved": true,
                    "remarks": null,
                    "consigneeName": "Some Consignee Name",
                    "contactName": "Some Contact Name",
                    "createdOn": "2015-08-28",
                    "issueDisplayName": "Not Received",
                    "itemDescription": "Some Description",
                    "runnableId": 12,
                    "isRetriggered": false
                }
            ], "pageSize": 2, "next": "http://localhost:8000/api/alert/?page=2&paginate=true"
        };

    var adminPermissions = [
        "auth.can_view_self_contacts",
        "auth.can_view_contacts",
        "auth.can_create_contacts",
        "auth.can_edit_contacts",
        "auth.can_delete_contacts"
    ];

    beforeEach(function () {
        module('Alerts');

        mockAlertsService = jasmine.createSpyObj('mockAlertsService', ['all', 'update', 'get']);
        mockLoaderService = jasmine.createSpyObj('mockLoaderService', ['showLoader', 'hideLoader', 'showModal']);
        mockDeliveryService = jasmine.createSpyObj('mockDeliveryService', ['retriggerDelivery']);
        mockUserService = jasmine.createSpyObj('mockUserService', ['hasPermission', 'retrieveUserPermissions'])
        mockSortService = jasmine.createSpyObj('mockSortService', ['sortBy']);
        mockSortArrowService = jasmine.createSpyObj('mockSortArrowService', ['setSortArrow']);

        inject(function ($controller, $rootScope, $q, ngToast) {
            scope = $rootScope.$new();
            q = $q;
            deferred = $q.defer();
            deferredAlerts = $q.defer();
            deferredAlerts.resolve(alertsResponses);
            mockToast = ngToast;
            deferredPermissionsResultsPromise = $q.defer();
            userHasPermissionToPromise = $q.defer();
            mockAlertsService.all.and.returnValue(deferredAlerts.promise);
            mockAlertsService.get.and.returnValue($q.when({'total': 4, 'unresolved': 2}));
            mockAlertsService.update.and.returnValue($q.when({}));
            mockUserService.hasPermission.and.returnValue(userHasPermissionToPromise.promise);
            mockUserService.retrieveUserPermissions.and.returnValue(deferredPermissionsResultsPromise.promise);

            spyOn(mockToast, 'create');

            $controller('AlertsController', {
                $scope: scope,
                ngToast: mockToast,
                AlertsService: mockAlertsService,
                DeliveryService: mockDeliveryService,
                UserService: mockUserService,
                LoaderService: mockLoaderService,
                SortService: mockSortService,
                SortArrowService: mockSortArrowService
            });
        });
    });

    describe('when loaded ', function () {
        beforeEach(function () {
            deferredPermissionsResultsPromise.resolve(adminPermissions);
        });

        it('should set delivery alerts on scope from result of service call', function () {
            scope.$apply();
            expect(mockAlertsService.all).toHaveBeenCalledWith([], {
                page: 1,
                field: 'alertDate',
                order: 'desc',
                paginate: 'true',
                type: 'delivery'
            });
            expect(scope.alerts).toEqual(expectedAlerts);
            expect(mockLoaderService.showLoader).toHaveBeenCalled();
            expect(mockLoaderService.hideLoader).toHaveBeenCalled();
        });

        it('should set item alerts on scope when type is changed to item', function () {
            var item_type = 'item';
            scope.changeAlertType(item_type);
            scope.$apply();
            expect(mockAlertsService.all).toHaveBeenCalledWith([], {
                page: 1,
                field: 'alertDate',
                order: 'desc',
                paginate: 'true',
                type: 'item'
            });
            expect(mockLoaderService.showLoader).toHaveBeenCalled();
            expect(mockLoaderService.hideLoader).toHaveBeenCalled();
        });

        it('should fetch new page when pageChanged is called and put the consignees on that page on scope', function () {
            scope.goToPage(10);
            scope.$apply();
            expect(mockAlertsService.all).toHaveBeenCalledWith([], {
                page: 10,
                field: 'alertDate',
                order: 'desc',
                paginate: 'true',
                type: 'delivery'
            });
            expect(scope.alerts).toEqual(expectedAlerts);
            expect(mockLoaderService.showLoader).toHaveBeenCalled();
            expect(mockLoaderService.hideLoader).toHaveBeenCalled();
        });

        it('should check whether alert type is the active type', function () {
            scope.$apply();
            expect(scope.isActiveAlertType('delivery')).toBeTruthy();
            expect(scope.isActiveAlertType('item')).toBeFalsy();

            scope.type = 'item';
            expect(scope.isActiveAlertType('delivery')).toBeFalsy();
            expect(scope.isActiveAlertType('item')).toBeTruthy();
        });
    });

    describe('Resolve Alerts ', function () {
        beforeEach(function () {
            deferredPermissionsResultsPromise.resolve(adminPermissions);
        });

        it('should call the update with remarks and alert id', function () {
            var alertId = 1;
            scope.$apply();

            var remarks = 'some remarks about an alert';
            scope.resolveAlert(alertId, remarks);
            scope.$apply();

            expect(mockAlertsService.update).toHaveBeenCalledWith({
                id: alertId,
                remarks: remarks,
                is_resolved: undefined
            }, 'PATCH');
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

            expect(mockAlertsService.all).toHaveBeenCalledWith([], {
                page: 1,
                field: 'alertDate',
                order: 'desc',
                paginate: 'true',
                type: 'delivery'
            });
            expect(mockAlertsService.all.calls.count()).toEqual(2);
        });

        it('should set modal flag to true when add remark button is clicked', function () {
            scope.remark(0);
            scope.$apply();

            expect(mockLoaderService.showModal).toHaveBeenCalledWith('resolve-alert-modal-0');
        });

        it('should set modal flag to true when show remark button is clicked', function () {
            scope.remark(1);
            scope.$apply();

            expect(mockLoaderService.showModal).toHaveBeenCalledWith('resolve-alert-modal-1');
        });

        it('should retrigger a manual flow when retrigger button is clicked and then create successful toast', function () {
            mockDeliveryService.retriggerDelivery.and.returnValue(q.when());
            scope.retriggerDelivery(10);
            scope.$apply();

            expect(mockDeliveryService.retriggerDelivery).toHaveBeenCalledWith(10);
            expect(mockToast.create).toHaveBeenCalledWith({
                content: 'The confirmation to IP has been retriggered.',
                class: 'success'
            });
        });

        it('should show retrigger column when retrigger button exists', function () {
            scope.$apply();

            expect(scope.isRetriggerColumnAvailable(scope.alerts)).toBe(true);
        });

        it('should show retrigger button when only unreceived and unresolved alert exists', function () {
            scope.$apply();

            expect(scope.isRetriggerBtnAvailable(scope.alerts[0])).toBe(true);
            expect(scope.isRetriggerBtnAvailable(scope.alerts[1])).toBe(false);
            expect(scope.isRetriggerBtnAvailable(scope.alerts[2])).toBe(false);
        });
    });
});
