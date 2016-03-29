describe('ItemFeedbackReportController', function () {
    var scope, location, mockReportService, mockLoader, timeout, initController, mockSystemSettingsService, mockConsigneeService,
        mockAnswerService, mockUserService;
    var deferredResult, deferredUpdateNumericAnswerResult, getCurrentUserDeferedResult, getConsigneeDeferedResult, userHasPermissionToPromise, deferredPermissionsResultsPromise;
    var stubSettings = {
        'notification_message': 'notification',
        'district_label': 'district'
    };
    var stubUpdatedAmountReceived = {
        "remark": "x-remark-28",
        "id": 15,
        "value": 28
    };
    var stubOriginalAmountReceived = {
        "remark": "x-remark-2",
        "id": 15,
        "value": 2
    };
    var stubResultReports = {
        "count": 3,
        "pageSize": 10,
        "results": [
            {
                "mergedDateOfReceipt": "2015-12-30",
                "consignee": "WAKISO DHO",
                "answers": {
                    "qualityOfProduct": {
                        "id": 93,
                        "value": "Damaged"
                    },
                    "amountReceived": {
                        "remark": "x-remark-2",
                        "id": 15,
                        "value": 2
                    },
                    "dateOfReceipt": {
                        "id": 39,
                        "value": "2015-12-30"
                    },
                    "satisfiedWithProduct": {
                        "id": 94,
                        "value": "No"
                    },
                    "productReceived": {
                        "id": 92,
                        "value": "Yes"
                    }
                },
                "additional_remarks": null,
                "implementing_partner": "WAKISO DHO",
                "contact_person_id": null,
                "item_description": "IEHK2006,kit,suppl.1-drugs",
                "tree_position": "END_USER",
                "value": 4.47,
                "location": "Amuru",
                "plan_answers": {
                    "deliveryReceived": {
                        "id": 60,
                        "value": "Yes"
                    },
                    "satisfiedWithDelivery": {
                        "id": 62,
                        "value": "Yes"
                    },
                    "isDeliveryInGoodOrder": {
                        "id": 61,
                        "value": "Yes"
                    },
                    "dateOfReceipt": {
                        "id": 25,
                        "value": "2015-12-09T16:00:00.000Z"
                    },
                    "additionalDeliveryComments": {
                        "id": 26,
                        "value": "Good"
                    }
                },
                "programme": {
                    "id": 1,
                    "name": "YI106 - PCR 2 KEEP CHILDREN LEARNING"
                },
                "order_number": 201443,
                "quantity_shipped": 1
            },
            {
                "mergedDateOfReceipt": null,
                "consignee": "WAKISO DHO",
                "answers": {},
                "additional_remarks": null,
                "implementing_partner": "WAKISO DHO",
                "contact_person_id": null,
                "item_description": "IEHK2006,kit,suppl.1-drugs",
                "tree_position": "IMPLEMENTING_PARTNER",
                "value": 4.47,
                "location": "Amuru",
                "plan_answers": {
                    "deliveryReceived": {
                        "id": 28,
                        "value": "No"
                    }
                },
                "programme": {
                    "id": 1,
                    "name": "YI106 - PCR 2 KEEP CHILDREN LEARNING"
                },
                "order_number": 201443,
                "quantity_shipped": 1
            }
        ],
        "next": null,
        "programmeIds": [
            1
        ],
        "previous": null
    };

    beforeEach(function () {
        module('ItemFeedbackReport');

        mockLoader = jasmine.createSpyObj('mockLoader', ['showLoader', 'hideLoader', 'showModal', 'hideModal']);
        mockUserService = jasmine.createSpyObj('mockUserService', ['hasPermission', 'retrieveUserPermissions', 'getCurrentUser']);
        mockConsigneeService = jasmine.createSpyObj('mockConsigneeService', ['get']);
        mockReportService = jasmine.createSpyObj('mockReportService', ['itemFeedbackReport']);
        mockSystemSettingsService = jasmine.createSpyObj('mockSystemSettingsService', ['getSettings', 'getSettingsWithDefault']);
        mockAnswerService = jasmine.createSpyObj('mockAnswerService', ['updateNumericAnswer']);

        inject(function ($controller, $q, $location, $rootScope, $timeout) {
            scope = $rootScope.$new();
            location = $location;
            timeout = $timeout;

            deferredResult = $q.defer();
            deferredUpdateNumericAnswerResult = $q.defer();
            userHasPermissionToPromise = $q.defer();
            getCurrentUserDeferedResult = $q.defer();
            getConsigneeDeferedResult = $q.defer();

            deferredPermissionsResultsPromise = $q.defer();
            mockUserService.getCurrentUser.and.returnValue(getCurrentUserDeferedResult.promise);
            mockReportService.itemFeedbackReport.and.returnValue(deferredResult.promise);
            mockAnswerService.updateNumericAnswer.and.returnValue(deferredUpdateNumericAnswerResult.promise);
            mockConsigneeService.get.and.returnValue(getConsigneeDeferedResult.promise);
            mockUserService.hasPermission.and.returnValue(userHasPermissionToPromise.promise);
            mockUserService.retrieveUserPermissions.and.returnValue(deferredPermissionsResultsPromise.promise);
            mockSystemSettingsService.getSettings.and.returnValue($q.when(stubSettings));
            mockSystemSettingsService.getSettingsWithDefault.and.returnValue($q.when(stubSettings));

            initController = function (route) {
                $controller('ItemFeedbackReportController', {
                    $scope: scope,
                    $location: location,
                    $routeParams: route,
                    ReportService: mockReportService,
                    AnswerService: mockAnswerService,
                    UserService: mockUserService,
                    SystemSettingsService: mockSystemSettingsService,
                    LoaderService: mockLoader
                });
            };
            initController({});
        });
    });

    describe('on load', function () {
        it('should show the loader and hide it after the loading data', function () {
            deferredResult.resolve({results: [{}, {}]});
            scope.$apply();

            expect(mockLoader.showLoader).toHaveBeenCalled();
            expect(mockLoader.showLoader.calls.count()).toEqual(1);
            expect(mockLoader.hideLoader).toHaveBeenCalled();
            expect(mockLoader.hideLoader.calls.count()).toEqual(1);
        });

        it('should call reports service', function () {
            var response = {results: [{id: 3}, {id: 33}]};
            deferredResult.resolve(response);
            scope.$apply();

            expect(mockReportService.itemFeedbackReport).toHaveBeenCalled();
            expect(scope.report).toEqual(response.results)
        });

        it('should call reports service filter by location if required', function () {
            var response = {results: [{id: 3}, {id: 33}]};
            deferredResult.resolve(response);
            scope.$apply();

            expect(mockReportService.itemFeedbackReport).toHaveBeenCalledWith({
                field: 'mergedDateOfReceipt',
                order: 'desc'
            }, 1);
            expect(scope.report).toEqual(response.results);
        });
    });

    describe('on click ip note remark icon', function () {
        it('should show modal', function () {
            scope.$apply();
            scope.showAdditionalRemarks()
            expect(mockLoader.showModal).toHaveBeenCalledWith('additional-remarks-modal-dialog');
        });
    });

    describe('on filtering', function () {
        it('should call endpoint with search term after ', function () {
            scope.$apply();

            var searchTerm = {ip: 2};
            scope.searchTerm = searchTerm;
            scope.$apply();

            expect(mockReportService.itemFeedbackReport.calls.count()).toEqual(2);
            expect(mockReportService.itemFeedbackReport).toHaveBeenCalledWith({
                field: 'mergedDateOfReceipt',
                order: 'desc',
                ip: 2
            }, 1);
        });

        it('should call endpoint when searchTerm district changes', function () {
            scope.searchTerm.selectedLocation = 'Adjumani';
            scope.$apply();

            expect(mockReportService.itemFeedbackReport).toHaveBeenCalledWith({
                field: 'mergedDateOfReceipt',
                order: 'desc',
                selectedLocation: 'Adjumani'
            }, 1);
        });
    });

    describe('on paginate', function () {
        it('should call the service with page number', function () {
            deferredResult.resolve({results: [{}, {}]});
            scope.searchTerm = {};
            scope.$apply();

            scope.goToPage(2);
            scope.$digest();

            expect(mockReportService.itemFeedbackReport).toHaveBeenCalledWith({
                field: 'mergedDateOfReceipt',
                order: 'desc'
            }, 2);
            expect(mockReportService.itemFeedbackReport.calls.count()).toEqual(2);
        });
    });

    describe('on adjusting stock/quantity-received', function () {
        it('should show stock adjust modal dialog, and cache editing object', function () {
            deferredResult.resolve(stubResultReports);
            deferredUpdateNumericAnswerResult.resolve(stubUpdatedAmountReceived);
            scope.searchTerm = {};
            scope.$apply();

            scope.showStockAdjustmentDialog(stubOriginalAmountReceived);
            expect(mockLoader.showModal).toHaveBeenCalledWith('stock-adjustment-modal-dialog');
            expect(scope.editingAmountReceivedObj).toEqual(stubOriginalAmountReceived);
        });

        it('should save amount-received changes, and clear editing object cache', function () {
            deferredResult.resolve(stubResultReports);
            deferredUpdateNumericAnswerResult.resolve(stubUpdatedAmountReceived);
            scope.searchTerm = {};
            scope.$apply();

            scope.saveStockAdjustment(stubUpdatedAmountReceived);
            scope.$digest();

            expect(mockAnswerService.updateNumericAnswer).toHaveBeenCalledWith(15, {value: 28, remark: 'x-remark-28'});
            var theItem = scope.report.find(function (item) {
                return item.answers &&
                    item.answers.amountReceived &&
                    item.answers.amountReceived.id === stubUpdatedAmountReceived.id;
            });
            expect(theItem.answers.amountReceived.value).toEqual(stubUpdatedAmountReceived.value);
            expect(scope.editingAmountReceivedObj).toEqual({});
        });
    });
});
