describe('Supply Efficiency Report Controller Spec', function () {

    var scope, childScope, mockReportService, mockLocation, mockLoaderService;
    var mockViews = {DELIVERY: 1, ITEM: 2, OUTCOME: 3, DOCUMENT: 4, IP: 5, LOCATION: 6};
    var mockReport =
        [
            {
                "delivery_stages": {
                    "unicef": {
                        "total_value":  200
                    },
                    "ip_receipt": {
                        "total_value_received":  150
                    },
                    "ip_distribution": {
                        "total_value_distributed":  150
                    },
                    "end_user": {
                        "total_value_received":  100
                    }
                }
            }
            ,{
            "delivery_stages": {
                "unicef": {
                    "total_value": 300
                },
                "ip_receipt": {
                    "total_value_received": 200
                },
                "ip_distribution": {
                    "total_value_distributed":  180
                },
                "end_user": {
                    "total_value_received": 120
                }
            }
        },
            {
                "delivery_stages": {
                    "unicef": {
                        "total_value": 400
                    },
                    "ip_receipt": {
                        "total_value_received": 250
                    },
                    "ip_distribution": {
                        "total_value_distributed":  150
                    },
                    "end_user": {
                        "total_value_received":  80
                    }
                }
            }
        ];

    beforeEach(function () {
        module('SupplyEfficiencyReport');
        mockReportService = jasmine.createSpyObj('mockSupplyEfficiencyReportService', ['generate']);
        mockLocation = jasmine.createSpyObj('$location', ['search']);
        mockLoaderService = jasmine.createSpyObj('mockLoaderService', ['showLoader', 'hideLoader']);

        inject(function ($rootScope, $controller, $q) {
            mockReportService.generate.and.returnValue($q.when(mockReport));
            mockReportService.VIEWS = mockViews;
            mockLocation.search.and.returnValue({by: 'delivery'});

            scope = $rootScope.$new();
            childScope = scope.$new();

            $controller('SupplyEfficiencyReportController', {
                $scope: scope,
                SupplyEfficiencyReportService: mockReportService,
                $location: mockLocation,
                LoaderService: mockLoaderService
            });
        });
    });

    it('should show loader on load', function () {
        scope.$apply();
        expect(mockLoaderService.showLoader).toHaveBeenCalled();
        expect(mockLoaderService.hideLoader).toHaveBeenCalled();
    });

    it('should receive filters from filters controller', function () {
        var newFilters = {consignee: 1};
        childScope.$emit('filters-changed', newFilters);
        scope.$apply();
        expect(scope.filters).toEqual(newFilters);
    });

    it('should generate new report when filters change', function () {
        childScope.$emit('filters-changed', {consignee: 3});
        scope.$apply();
        expect(mockReportService.generate).toHaveBeenCalledWith(mockViews.DELIVERY, {consignee: 3})
        expect(mockLoaderService.showLoader).toHaveBeenCalled();
        expect(mockLoaderService.hideLoader).toHaveBeenCalled();
    });

    it('should put views on scope', function () {
        scope.$apply();
        expect(scope.views).toEqual(mockViews);
    });

    it('should put calculated totals on scope', function () {
        scope.$apply();
        var totals = {UNICEFShipped: 900, IPReceived: 600, endUserReceived: 300};
        expect(scope.totals).toEqual(totals);
    });

    it('should pick current view from url on load', inject(function ($controller) {
        testViewInUrlIsSetOnController($controller, 'item', mockViews.ITEM);
        testViewInUrlIsSetOnController($controller, 'delivery', mockViews.DELIVERY);
        testViewInUrlIsSetOnController($controller, 'document', mockViews.DOCUMENT);
        testViewInUrlIsSetOnController($controller, 'outcome', mockViews.OUTCOME);
        testViewInUrlIsSetOnController($controller, 'ip', mockViews.IP);
        testViewInUrlIsSetOnController($controller, 'location', mockViews.LOCATION);
    }));

    function testViewInUrlIsSetOnController($controller, viewInUrl, expectedControllerView) {
        mockLocation.search.and.returnValue({by: viewInUrl});
        $controller('SupplyEfficiencyReportController', {
            $scope: scope,
            SupplyEfficiencyReportService: mockReportService,
            $location: mockLocation,
            LoaderService: mockLoaderService
        });

        scope.$apply();
        expect(scope.view).toEqual(expectedControllerView)
    }
});
