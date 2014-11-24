describe('ResponsesController', function () {
    var mockProgrammeService, mockResponsesService, mockSalesOrderService, mockSalesOrderItemService;

    var deferredResponsesPromise, deferredProgrammePromise, deferredSalesOrderPromise,
        deferredSalesOrderItemPromise, deferredSalesOrderItemConsigneePromise;

    var scope, q;

    var stubProgrammes = { data: [
            {
                'programme': {
                    id: 3,
                    name: 'Alive'
                },
                'salesorder_set': ['1']
            }
        ]
    }

    var stubSalesOrders = [
        {
            id: 1,
            'programme': {
                id: 3,
                name: 'Alive'
            },
            'order_number': '00001',
            'date': '2014-10-05',
            'salesorderitem_set': ['1']
        },
        {
            id: 2,
            'programme': {
                id: 4,
                name: 'Alive'
            },
            'order_number': '22221',
            'date': '2014-10-05',
            'salesorderitem_set': [3, 4]
        }
    ];

    var stubSalesOrderItem = {
        id: 1,
        sales_order: '1',
        information: {
            id: 1,
            item: {
                id: 1,
                description: 'Test Item',
                material_code: '12345AS',
                unit: {
                    name: 'EA'
                }
            },
            quantity: 100,
            quantity_left: 100
        },
        quantity: 100,
        net_price: 10.00,
        net_value: 1000.00,
        issue_date: '2014-10-02',
        delivery_date: '2014-10-02',
        distributionplanlineitem_set: [1, 2]
    };

    var formattedSalesOrderItem = [
        {
            id: 1,
            display: 'Test Item',
            materialCode: '12345AS',
            quantity: 100,
            unit: 'EA',
            information: stubSalesOrderItem.information
        }
    ];

    var stubConsignees = [
        {   children: [],
            consignee: 10,
            consignee_name: 'PADER DHO',
            contact_person_id: '5420508290cc38715b1af928',
            distribution_plan: 2,
            distributionplanlineitem_set: [1],
            id: 5,
            location: 'PADER',
            mode_of_delivery: 'WAREHOUSE',
            parent: null,
            tree_position: 'MIDDLE_MAN'
        }
    ];


    var stubResponses = {
        answers: { amountReceived: '50',
            dateOfReceipt: '6/10/2014',
            feedbackAboutDissatisfaction: 'they were damaged',
            informedOfDelay: 'No',
            productReceived: 'Yes',
            qualityOfProduct: 'Good',
            revisedDeliveryDate: 'didnt not specify',
            satisfiedWithProduct: 'Yes'},
        children: [2],
        node: 'PADER DHO'
    };

    var formattedStubResponses = [
        { Consignee: 'PADER DHO',
          amountReceived: '50',
          dateOfReceipt: '6/10/2014',
          feedbackAboutDissatisfaction: 'they were damaged',
          informedOfDelay: 'No',
          productReceived: 'Yes',
          qualityOfProduct: 'Good',
          revisedDeliveryDate: 'didnt not specify',
          satisfiedWithProduct: 'Yes',
          children: [  ]
        }
    ];

    beforeEach(function () {
        module('Responses');

        mockResponsesService = jasmine.createSpyObj('mockResponsesService', ['fetchResponses']);
        mockProgrammeService = jasmine.createSpyObj('mockProgrammeService', ['fetchProgrammes']);
        mockSalesOrderService = jasmine.createSpyObj('mockSalesOrderService', ['getSalesOrder']);
        mockSalesOrderItemService = jasmine.createSpyObj('mockSalesOrderItemService', ['getSalesOrderItem', 'getTopLevelDistributionPlanNodes']);

        inject(function ($controller, $q, $rootScope) {
            q = $q;
            deferredResponsesPromise = $q.defer();
            deferredProgrammePromise = $q.defer();
            deferredSalesOrderPromise = $q.defer();
            deferredSalesOrderItemPromise = $q.defer();
            deferredSalesOrderItemConsigneePromise = $q.defer();
            mockResponsesService.fetchResponses.and.returnValue(deferredResponsesPromise.promise);
            mockProgrammeService.fetchProgrammes.and.returnValue(deferredProgrammePromise.promise);
            mockSalesOrderService.getSalesOrder.and.returnValue(deferredSalesOrderPromise.promise);
            mockSalesOrderItemService.getSalesOrderItem.and.returnValue(deferredSalesOrderItemPromise.promise);
            mockSalesOrderItemService.getTopLevelDistributionPlanNodes.and.returnValue(deferredSalesOrderItemConsigneePromise.promise);

            scope = $rootScope.$new();

            $controller('ResponsesController', {
                $scope: scope,
                ResponsesService: mockResponsesService,
                ProgrammeService: mockProgrammeService,
                SalesOrderService: mockSalesOrderService,
                SalesOrderItemService: mockSalesOrderItemService
            });
        });
    });

    it('should fetch programmes when controller is initialized', function () {
        deferredProgrammePromise.resolve(stubProgrammes);
        scope.initialize();
        scope.$apply();

        expect(scope.programmes).toEqual(stubProgrammes.data);
    });

    it('should fetch sales order when programme is selected', function () {
        deferredSalesOrderPromise.resolve(stubSalesOrders[0]);
        scope.selectedProgramme = stubProgrammes.data[0];

        scope.selectProgramme();
        scope.$apply();

        expect(scope.salesOrders).toEqual([stubSalesOrders[0]]);
    });

    it('should fetch sales order item when sales order is selected', function () {
        deferredSalesOrderItemPromise.resolve(stubSalesOrderItem.information);
        scope.selectedSalesOrder = stubSalesOrders[0];

        scope.selectSalesOrder();
        scope.$apply();

        expect(scope.salesOrderItems).toEqual(formattedSalesOrderItem);
    });

    it('should fetch sales order item consignees and responses when sales order item is selected', function () {
        deferredSalesOrderItemPromise.resolve(stubSalesOrderItem);
        deferredSalesOrderItemConsigneePromise.resolve(stubConsignees);
        deferredResponsesPromise.resolve(stubResponses);

        scope.selectedSalesOrderItem = formattedSalesOrderItem[0];

        scope.selectSalesOrderItem();
        scope.$apply();

        expect(scope.salesOrderItemConsignees).toEqual(stubConsignees);
        expect(scope.responses).toEqual(formattedStubResponses);
    });

    it('should set no responses if no distribution plan for a sales order line item', function () {
        deferredSalesOrderItemPromise.resolve(stubSalesOrderItem);
        deferredSalesOrderItemConsigneePromise.resolve([]);

        scope.selectedSalesOrderItem = formattedSalesOrderItem[0];

        scope.selectSalesOrderItem();
        scope.$apply();

        expect(scope.noResponses).toEqual("No responses found");
    });

    it('should fetch responses for a plan that matches for a sales order line item and consignee', function () {
        deferredResponsesPromise.resolve(stubResponses);
        scope.selectedSalesOrderItem = formattedSalesOrderItem[0];
        scope.selectedSalesOrderItemConsignee = stubConsignees[0];

        scope.selectSalesOrderItemConsignee();
        scope.$apply();

        expect(scope.responses).toEqual(formattedStubResponses);
    });

     it('should set no responses if a plan has no reponses for a sales order line item and consignee', function () {
        deferredResponsesPromise.resolve({answers: {}});
        scope.selectedSalesOrderItem = formattedSalesOrderItem[0];
        scope.selectedSalesOrderItemConsignee = stubConsignees[0];

        scope.selectSalesOrderItemConsignee();
        scope.$apply();

        expect(scope.noResponses).toEqual("No responses found");
    });
});
