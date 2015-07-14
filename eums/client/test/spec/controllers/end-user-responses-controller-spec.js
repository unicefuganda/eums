describe('EndUserResponsesController', function () {
    var mockDistributionPlanService, mockProgrammeService, mockConsigneeService, mockPurchaseOrderService, mockItemService;

    var deferredDistributionPlanPromise, deferredProgrammePromise, deferredConsigneePromise, deferredPurchaseOrderPromise, deferredItemPromise;

    var scope, q, location;

    var stubProgrammes = [
        {
            'programme': {
                id: 3,
                name: 'Alive'
            },
            'salesorder_set': ['1']
        }
    ];

    var stubConsignees = [
        {
            children: [],
            consignee: 10,
            consignee_name: 'PADER DHO',
            contact_person_id: '5420508290cc38715b1af928',
            distribution_plan: 2,
            distributionplannode_set: [1],
            id: 5,
            location: 'PADER',
            parent: null,
            tree_position: 'MIDDLE_MAN'
        }
    ];

    var stubPurchaseOrders = [
        {
            id: 1,
            order_number: 25565,
            sales_order: 2,
            date: '2014-10-06',
            purchaseorderitem_set: [3, 4]
        }
    ];

    var stubItems = [
        {
            id: 1,
            description: 'Computer',
            material_code: '12345AS',
            unit: {
                name: 'EA'
            }
        }
    ];

    var stubResponses = {
        data: [
            {
                amountReceived: '30',
                amountSent: 30,
                consignee: {
                    id: 5,
                    name: 'PADER DHO'
                },
                dateOfReceipt: '19/11/2014',
                feedbackAboutDissatisfaction: 'We are enjoying',
                ip: {
                    id: 5,
                    name: 'PADER DHO'
                },
                item: 'Computer',
                productReceived: 'Yes',
                programme: {
                    id: 3,
                    name: 'Alive'
                },
                qualityOfProduct: 'Good',
                satisfiedWithProduct: 'Yes',
                purchase_order: {
                    id: 1,
                    order_number: 25565
                },
                contact_person: {
                    firstName: 'John',
                    secondName: 'Doe',
                    phone: '+234778945674'
                }
            },
            {
                amountReceived: '10',
                amountSent: 10,
                consignee: {
                    id: 6,
                    name: 'Kitgum DHO'
                },
                dateOfReceipt: '19/11/2014',
                feedbackAboutDissatisfaction: 'Satisfactory',
                ip: {
                    id: 6,
                    name: 'Kitgum DHO'
                },
                item: 'Generator',
                productReceived: 'Yes',
                programme: {
                    id: 4,
                    name: 'Malaria Consortium'
                },
                qualityOfProduct: 'Good',
                satisfiedWithProduct: 'No',
                purchase_order: {
                    id: 2,
                    order_number: 25567
                },
                contact_person: {
                    firstName: 'Jane',
                    secondName: 'Doe',
                    phone: '+234778345674'
                }
            }
        ]
    };

    beforeEach(function () {
        module('EndUserResponses');

        mockDistributionPlanService = jasmine.createSpyObj('mockDistributionPlanService', ['getAllEndUserResponses']);
        mockProgrammeService = jasmine.createSpyObj('mockProgrammeService', ['all']);
        mockConsigneeService = jasmine.createSpyObj('mockConsigneeService', ['all']);
        mockPurchaseOrderService = jasmine.createSpyObj('mockPurchaseOrderService', ['all']);
        mockItemService = jasmine.createSpyObj('mockItemService', ['all']);

        inject(function ($controller, $q, $location, $rootScope) {
            q = $q;
            deferredDistributionPlanPromise = $q.defer();
            deferredProgrammePromise = $q.defer();
            deferredConsigneePromise = $q.defer();
            deferredItemPromise = $q.defer();
            deferredPurchaseOrderPromise = $q.defer();
            mockDistributionPlanService.getAllEndUserResponses.and.returnValue(deferredDistributionPlanPromise.promise);
            mockProgrammeService.all.and.returnValue(deferredProgrammePromise.promise);
            mockConsigneeService.all.and.returnValue(deferredConsigneePromise.promise);
            mockPurchaseOrderService.all.and.returnValue(deferredPurchaseOrderPromise.promise);
            mockItemService.all.and.returnValue(deferredItemPromise.promise);

            scope = $rootScope.$new();
            location = $location;

            $controller('EndUserResponsesController', {
                $scope: scope,
                $location: location,
                DistributionPlanService: mockDistributionPlanService,
                ProgrammeService: mockProgrammeService,
                ConsigneeService: mockConsigneeService,
                PurchaseOrderService: mockPurchaseOrderService,
                ItemService: mockItemService
            });
        });
    });

    it('should fetch programmes when controller is initialized', function () {
        deferredProgrammePromise.resolve(stubProgrammes);
        scope.initialize();
        scope.$apply();

        expect(scope.programmes).toEqual([{id: 0, name: 'All Outcomes'}].concat(stubProgrammes));
    });

    it('should fetch all purchase orders when controller is initialized', function () {
        deferredPurchaseOrderPromise.resolve(stubPurchaseOrders);
        scope.initialize();
        scope.$apply();

        expect(scope.purchaseOrders).toEqual([{id: 0, order_number: 'All Purchase Orders'}].concat(stubPurchaseOrders));
    });

    it('should fetch all items when controller is initialized', function () {
        deferredItemPromise.resolve(stubItems);
        scope.initialize();
        scope.$apply();

        expect(scope.items).toEqual([{id: 0, description: 'All Items'}].concat(stubItems));
    });

    it('should fetch all responses when controller is initialized', function () {
        deferredDistributionPlanPromise.resolve(stubResponses);
        scope.initialize();
        scope.$apply();

        expect(scope.allResponses).toEqual(stubResponses.data);
    });

    it('should fetch filtered responses for programme when programme is selected', function () {
        deferredDistributionPlanPromise.resolve(stubResponses);
        scope.selectedProgramme = stubProgrammes[0].programme;

        scope.initialize();
        scope.$apply();
        scope.selectProgramme();
        scope.$apply();

        expect(scope.allResponses).toEqual(stubResponses.data);
        expect(scope.filteredResponses).toEqual([stubResponses.data[0]]);
    });

    it('should fetch all responses for programme when All Programmes is selected', function () {
        deferredDistributionPlanPromise.resolve(stubResponses);
        scope.selectedProgramme = {id: 0, name: 'All Programmes'};

        scope.initialize();
        scope.$apply();
        scope.selectProgramme();
        scope.$apply();

        expect(scope.allResponses).toEqual(stubResponses.data);
        expect(scope.filteredResponses).toEqual(stubResponses.data);
    });

    it('should fetch filtered responses for consignees when consignee is selected', function () {
        deferredDistributionPlanPromise.resolve(stubResponses);
        scope.selectedConsignee = stubConsignees[0];

        scope.initialize();
        scope.$apply();
        scope.selectConsignee();
        scope.$apply();

        expect(scope.allResponses).toEqual(stubResponses.data);
        expect(scope.filteredResponses).toEqual([stubResponses.data[0]]);
    });

    it('should fetch all responses for consignees when All Consignees is selected', function () {
        deferredDistributionPlanPromise.resolve(stubResponses);
        scope.selectedConsignee = {id: 0, name: 'All Consignees'};

        scope.initialize();
        scope.$apply();
        scope.selectConsignee();
        scope.$apply();

        expect(scope.allResponses).toEqual(stubResponses.data);
        expect(scope.filteredResponses).toEqual(stubResponses.data);
    });

    it('should fetch filtered responses for purchase orders when purchase order is selected', function () {
        deferredDistributionPlanPromise.resolve(stubResponses);
        scope.selectedPurchaseOrder = stubPurchaseOrders[0];

        scope.initialize();
        scope.$apply();
        scope.selectPurchaseOrder();
        scope.$apply();

        expect(scope.allResponses).toEqual(stubResponses.data);
        expect(scope.filteredResponses).toEqual([stubResponses.data[0]]);
    });

    it('should fetch all responses for purchase orders when All Purchase Orders is selected', function () {
        deferredDistributionPlanPromise.resolve(stubResponses);
        scope.selectedPurchaseOrder = {id: 0, order_number: 'All Purchase Orders'};

        scope.initialize();
        scope.$apply();
        scope.selectPurchaseOrder();
        scope.$apply();

        expect(scope.allResponses).toEqual(stubResponses.data);
        expect(scope.filteredResponses).toEqual(stubResponses.data);
    });

    it('should fetch filtered responses for items when item is selected', function () {
        deferredDistributionPlanPromise.resolve(stubResponses);
        scope.selectedItem = stubItems[0];

        scope.initialize();
        scope.$apply();
        scope.selectItem();
        scope.$apply();

        expect(scope.allResponses).toEqual(stubResponses.data);
        expect(scope.filteredResponses).toEqual([stubResponses.data[0]]);
    });

    it('should fetch all items for items when All Items is selected', function () {
        deferredDistributionPlanPromise.resolve(stubResponses);
        scope.selectedItem = {id: 0, description: 'All Items'};

        scope.initialize();
        scope.$apply();
        scope.selectItem();
        scope.$apply();

        expect(scope.allResponses).toEqual(stubResponses.data);
        expect(scope.filteredResponses).toEqual(stubResponses.data);
    });

    it('should fetch filtered responses for programme when programme is first selected and then All Consignees is selected', function () {
        deferredDistributionPlanPromise.resolve(stubResponses);
        scope.selectedProgramme = stubProgrammes[0].programme;
        scope.selectedConsignee = {id: 0, name: 'All Consignees'};

        scope.initialize();
        scope.$apply();
        scope.selectProgramme();
        scope.$apply();
        scope.selectConsignee();
        scope.$apply();

        expect(scope.allResponses).toEqual(stubResponses.data);
        expect(scope.filteredResponses).toEqual([stubResponses.data[0]]);
    });

    it('should fetch filtered responses for programme when All Consignees is selected first and then program is selected', function () {
        deferredDistributionPlanPromise.resolve(stubResponses);
        scope.selectedProgramme = stubProgrammes[0].programme;
        scope.selectedConsignee = {id: 0, name: 'All Consignees'};

        scope.initialize();
        scope.$apply();
        scope.selectConsignee();
        scope.$apply();
        scope.selectProgramme();
        scope.$apply();

        expect(scope.allResponses).toEqual(stubResponses.data);
        expect(scope.filteredResponses).toEqual([stubResponses.data[0]]);
    });

    it('should fetch filtered responses when programme is first selected and then consignee is selected', function () {
        deferredDistributionPlanPromise.resolve(stubResponses);
        scope.selectedProgramme = stubProgrammes[0].programme;
        scope.selectedConsignee = stubConsignees[0].consignee;

        scope.initialize();
        scope.$apply();
        scope.selectProgramme();
        scope.$apply();
        scope.selectConsignee();
        scope.$apply();

        expect(scope.allResponses).toEqual(stubResponses.data);
        expect(scope.filteredResponses).toEqual([stubResponses.data[0]]);
    });
});
