describe('StockReportController', function () {
    var scope, mockStockReportService, mockConsigneeService, mockIpService, mockLoaderService, mockEumsErrorMessageService,
        deferredStubReport, toastPromise, mockToastProvider, deferredDistricts, mockUserService,
        deferredUser, deferredConsignee, mockSystemSettingsService;
    var stubStockReport = {
        data: {
            count: 2,
            pageSize: 10,
            results: [
                {
                    document_number: '1',
                    total_value_received: 20.0,
                    total_value_dispensed: 10.0,
                    balance: 10.0,
                    items: [
                        {
                            code: 'Code 1',
                            description: 'description',
                            quantity_delivered: 3,
                            date_delivered: '2014-01-01',
                            quantity_confirmed: 2,
                            date_confirmed: '2014-01-02',
                            quantity_dispatched: 1,
                            balance: 1
                        },
                        {
                            code: 'Code 2',
                            description: 'description',
                            quantity_delivered: 4,
                            date_delivered: '2014-01-01',
                            quantity_confirmed: 2,
                            date_confirmed: '2014-01-02',
                            quantity_dispatched: 2,
                            balance: 1
                        }
                    ]
                },
                {
                    'document_number': '2',
                    'total_value_received': 30.0,
                    'total_value_dispensed': 15.0,
                    'balance': 15.0,
                    items: [
                        {
                            code: 'Code 3',
                            description: 'description',
                            quantity_delivered: 4,
                            date_delivered: '2014-01-01',
                            quantity_confirmed: 2,
                            date_confirmed: '2014-01-02',
                            quantity_dispatched: 2,
                            balance: 1
                        }
                    ]
                }
            ]
        }
    };
    var stubDistricts = {data: ['Adjumani', 'Luweero']};
    var adminUser = {"username": "admin", "first_name": "", "last_name": "", "email": "admin@tw.org", "consignee_id": null};
    var ipUser = {"username": "wakiso", "first_name": "", "last_name": "", "email": "ip@ip.com", "consignee_id": 5};
    var stubSettings = {
        'notification_message': 'notification',
        'district_label': 'district'
    };

    beforeEach(function () {
        module('StockReport');

        mockStockReportService = jasmine.createSpyObj('mockStockReportService', ['getStockReportForLocationAndConsignee',
            'getStockReportForLocation', 'getStockReportForConsignee', 'getStockReport', 'computeStockTotals']);
        mockToastProvider = jasmine.createSpyObj('mockToastProvider', ['create']);
        mockIpService = jasmine.createSpyObj('mockIpService', ['loadAllDistricts']);
        mockConsigneeService = jasmine.createSpyObj('mockConsigneeService', ['get']);
        mockLoaderService = jasmine.createSpyObj('mockLoaderService', ['showLoader', 'hideLoader']);
        mockUserService = jasmine.createSpyObj('mockUserService', ['getCurrentUser']);
        mockEumsErrorMessageService = jasmine.createSpyObj('mockEumsErrorMessageService', ['showError']);
        mockSystemSettingsService = jasmine.createSpyObj('mockSystemSettingsService', ['getSettings', 'getSettingsWithDefault']);

        inject(function ($controller, $rootScope, $q) {
            scope = $rootScope.$new();
            deferredStubReport = $q.defer();
            toastPromise = $q.defer();
            deferredDistricts = $q.defer();
            deferredConsignee = $q.defer();
            deferredUser = $q.defer();

            mockStockReportService.getStockReport.and.returnValue(deferredStubReport.promise);
            mockToastProvider.create.and.returnValue(toastPromise.promise);
            mockIpService.loadAllDistricts.and.returnValue(deferredDistricts.promise);
            mockConsigneeService.get.and.returnValue(deferredConsignee.promise);
            mockUserService.getCurrentUser.and.returnValue(deferredUser.promise);
            mockSystemSettingsService.getSettings.and.returnValue($q.when(stubSettings));
            mockSystemSettingsService.getSettingsWithDefault.and.returnValue($q.when(stubSettings));

            $controller('StockReportController', {
                $scope: scope,
                StockReportService: mockStockReportService,
                ConsigneeService: mockConsigneeService,
                ngToast: mockToastProvider,
                IPService: mockIpService,
                LoaderService: mockLoaderService,
                UserService: mockUserService,
                SystemSettingsService: mockSystemSettingsService,
                ErrorMessageService: mockEumsErrorMessageService
            });
        });
    });

    describe('on initial load', function () {

        beforeEach(function () {
            deferredUser.resolve(adminUser);
        });

        it('should load stock report', function () {
            scope.reportParams = {};
            scope.$apply();
            expect(mockStockReportService.getStockReport.calls.count()).toEqual(1);
            expect(mockStockReportService.getStockReport).toHaveBeenCalledWith({
                field: 'last_shipment_date',
                order: 'desc'
            });
        });

        it('should load districts', function () {
            deferredDistricts.resolve(stubDistricts);
            scope.$apply();
            expect(mockIpService.loadAllDistricts).toHaveBeenCalled();
            expect(scope.districts).toEqual([{id: 'Adjumani', name: 'Adjumani'}, {id: 'Luweero', name: 'Luweero'}])
        });

        it('should show and hide loader on stock report load success', function () {
            deferredStubReport.resolve(stubStockReport);
            scope.$apply();
            expect(mockLoaderService.showLoader).toHaveBeenCalled();
            expect(mockLoaderService.hideLoader).toHaveBeenCalled();
        });

        it('should show and hide loader on stock report load failure', function () {
            deferredStubReport.reject();
            scope.$apply();
            expect(mockLoaderService.showLoader).toHaveBeenCalled();
            expect(mockLoaderService.hideLoader).toHaveBeenCalled();
            expect(mockEumsErrorMessageService.showError).toHaveBeenCalled();
        });
    });

    describe('after initial load', function () {

        beforeEach(function () {
            // Initial Load
            deferredUser.resolve(adminUser);
            scope.reportParams = {};
            scope.$apply();
            expect(mockStockReportService.getStockReport.calls.count()).toEqual(1);
        });

        it('should set ip user to false when unicef user', function () {
            scope.$apply();
            expect(scope.isIpUser).toBeFalsy();
        });

        it('should load stock report for selected IP', function () {
            deferredStubReport.resolve(stubStockReport);
            scope.reportParams.selectedIPId = 1;
            scope.$apply();

            expect(mockStockReportService.getStockReport).toHaveBeenCalledWith({
                field: 'last_shipment_date',
                order: 'desc',
                consignee: 1
            });
        });

        it('should load stock report for selected location', function () {
            deferredStubReport.resolve(stubStockReport);
            scope.reportParams.selectedLocation = 1;
            scope.$apply();

            expect(mockStockReportService.getStockReport).toHaveBeenCalledWith({
                field: 'last_shipment_date',
                order: 'desc',
                location: 1
            });
        });

        it('should load stock report for selected location and IP', function () {
            deferredStubReport.resolve(stubStockReport);
            scope.reportParams.selectedLocation = 2;
            scope.$apply();
            scope.reportParams.selectedIPId = 1;
            scope.$apply();

            expect(mockStockReportService.getStockReport).toHaveBeenCalledWith({
                field: 'last_shipment_date',
                order: 'desc',
                location: 2,
                consignee: 1
            });
        });

        it('should load stock report for selected from date', function () {
            scope.reportParams.selectedFromDate = '01-Nov-2015';
            scope.$apply();

            expect(mockStockReportService.getStockReport).toHaveBeenCalledWith({
                field: 'last_shipment_date',
                order: 'desc',
                fromDate: '2015-11-01'
            });
        });

        it('should load stock report for selected to date', function () {
            scope.reportParams.selectedToDate = '01-Nov-2015';
            scope.$apply();

            expect(mockStockReportService.getStockReport).toHaveBeenCalledWith({
                field: 'last_shipment_date',
                order: 'desc',
                toDate: '2015-11-01'
            });
        });

        it('should load stock report for selected outcome', function () {
            scope.reportParams.selectedOutcomeId = 7;
            scope.$apply();
            expect(mockStockReportService.getStockReport).toHaveBeenCalledWith({
                field: 'last_shipment_date',
                order: 'desc',
                outcome: 7
            });
        });

        it('should load stock report when clearing outcome filter', function () {
            scope.reportParams.selectedOutcomeId = 7;
            scope.$apply();
            expect(mockStockReportService.getStockReport.calls.count()).toEqual(2);

            scope.reportParams.selectedOutcomeId = undefined;
            scope.$apply();
            expect(mockStockReportService.getStockReport.calls.count()).toEqual(3);
        });

        it('should load stock report when clearing location filter', function () {
            scope.reportParams.selectedLocation = 'Adjumani';
            scope.$apply();
            expect(mockStockReportService.getStockReport.calls.count()).toEqual(2);

            scope.reportParams.selectedLocation = undefined;
            scope.$apply();
            expect(mockStockReportService.getStockReport.calls.count()).toEqual(3);
        });

        it('should load stock report when clearing IP filter', function () {
            scope.reportParams.selectedIPId = 5;
            scope.$apply();
            expect(mockStockReportService.getStockReport.calls.count()).toEqual(2);

            scope.reportParams.selectedIPId = undefined;
            scope.$apply();
            expect(mockStockReportService.getStockReport.calls.count()).toEqual(3);
        });

        it('should not load stock report when selecting same location', function () {
            scope.reportParams.selectedLocation = 'Adjumani';
            scope.$apply();
            expect(mockStockReportService.getStockReport.calls.count()).toEqual(2);

            scope.$apply();
            expect(mockStockReportService.getStockReport.calls.count()).toEqual(2);
        });

        it('should not load stock report when selecting same IP', function () {
            scope.reportParams.selectedIPId = 5;
            scope.$apply();
            expect(mockStockReportService.getStockReport.calls.count()).toEqual(2);

            scope.$apply();
            expect(mockStockReportService.getStockReport.calls.count()).toEqual(2);
        });

        it('should set scope results to empty when no results', function () {
            deferredStubReport.resolve({data: {results: []}});
            scope.$apply();
            expect(scope.reportData).toEqual([]);
        });

        it('should load stock report for page', function () {
            deferredStubReport.resolve(stubStockReport);
            scope.goToPage(2);
            scope.$apply();

            expect(mockStockReportService.getStockReport).toHaveBeenCalledWith({
                field: 'last_shipment_date',
                order: 'desc',
                page: 2
            });
            expect(scope.count).toBe(2);
            expect(scope.pageSize).toBe(10);
        });

        it('should load stock report for page with selected ip and location', function () {
            deferredStubReport.resolve(stubStockReport);
            scope.reportParams.selectedIPId = 5;
            scope.$apply();
            scope.reportParams.selectedLocation = 4;
            scope.$apply();
            scope.goToPage(3);
            scope.$apply();

            expect(mockStockReportService.getStockReport).toHaveBeenCalledWith({
                field: 'last_shipment_date',
                order: 'desc',
                location: 4,
                consignee: 5,
                page: 3
            });
        });

        it('should not have empty data response when data is undefined', function () {
            scope.reportData = undefined;
            expect(scope.hasEmptyDataResponse()).toBeFalsy();
        });

        it('should have empty data response when actual response is empty', function () {
            scope.reportData = [];
            expect(scope.hasEmptyDataResponse()).toBeTruthy();
        });

        it('should not have empty data response when actual response has data', function () {
            scope.reportData = ['some data'];
            expect(scope.hasEmptyDataResponse()).toBeFalsy();
        });
    });

    describe('Toggle document', function () {
        it('should set the open document identifier', function () {
            scope.toggleOpenDocument(473732);
            scope.$apply();

            expect(scope.openDocument).toBe(473732);
        });

        it('should unset the open document identifier', function () {
            scope.openDocument = 473732;
            scope.$apply();

            scope.toggleOpenDocument(473732);
            scope.$apply();

            expect(scope.openDocument).toBe(undefined);
        });
    });

    describe('IP can only see their specific stock reports', function () {

        it('should get current user, then load stock reports for this user', function () {
            deferredUser.resolve(ipUser);
            scope.$apply();

            expect(mockUserService.getCurrentUser.calls.count()).toEqual(1);
            expect(mockStockReportService.getStockReport.calls.count()).toEqual(1);
            expect(mockStockReportService.getStockReport).toHaveBeenCalledWith({
                field: 'last_shipment_date',
                order: 'desc',
                consignee: 5
            });
        });

        it('should disable IP filter', function () {
            deferredUser.resolve(ipUser);
            scope.$apply();
            expect(scope.isIpUser).toBeTruthy();
        });

        it('should call consignee service', function () {
            deferredUser.resolve(ipUser);
            scope.$apply();
            expect(mockConsigneeService.get).toHaveBeenCalledWith(5);
        });

        it('should broadcast consignee on service call return', function () {
            spyOn(scope, '$broadcast');

            deferredUser.resolve(ipUser);
            var someConsignee = {name: 'Some Name'};
            deferredConsignee.resolve(someConsignee);

            scope.$apply();
            expect(scope.$broadcast).toHaveBeenCalledWith('set-consignee', someConsignee)
        });
    });
});