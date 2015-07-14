describe('ManualReportingDetailsController', function () {
    beforeEach(module('ManualReportingDetails'));

    var mockIPService, mockConsigneeService, mockOptionService, mockPurchaseOrderService, mockPurchaseOrderItemService,
        mockReleaseOrderService, mockReleaseOrderItemService, mockSalesOrderService,
        mockDistributionPlanService, mockDistributionPlanNodeService, mockSalesOrderItemService;
    var deferredDistrictPromise, deferredConsigneePromise, deferredOptionPromise, deferredPurchaseOrderPromise,
        deferredPurchaseOrderItemPromise, deferredReleaseOrderPromise, deferredReleaseOrderItemPromise,
        deferredLineItemPromise, deferredDistributionPlanPromise, deferredDistributionPlanNodePromise, deferredNodeResponsePromise,
        deferredSalesOrderItemPromise, deferredSalesOrderPromise;
    var scope, q, mockToastProvider, location;
    var stubSalesOrder, stubPurchaseOrder, stubReleaseOrder, stubSalesOrderItem, stubPurchaseOrderItem, stubReleaseOrderItem;
    var orderId = 1,
        salesOrderId = 1,
        programmeName = 'Test Programme';
    var nodeResponse;


    beforeEach(function () {
        stubSalesOrder = {
            id: salesOrderId,
            'programme': {
                id: 3,
                name: 'Alive'
            },
            'orderNumber': 10,
            'date': '2014-10-05',
            'salesorderitemSet': [1]
        };

        stubPurchaseOrder = {
            id: 1,
            orderNumber: orderId,
            salesOrder: stubSalesOrder,
            date: '2014-10-06',
            purchaseorderitemSet: [1],
            programme: programmeName
        };

        stubReleaseOrder = {
            id: 1,
            orderNumber: orderId,
            deliveryDate: '2014-10-06',
            description: 'Midwife Supplies',
            consignee: 1,
            waybill: 12,
            salesOrder: stubSalesOrder,
            purchaseOrder: stubPurchaseOrder,
            releaseorderitemSet: [1],
            programme: programmeName
        };

        stubSalesOrderItem = {
            id: 1,
            salesOrder: '1',
            information: {
                id: 1,
                item: {
                    id: 1,
                    description: 'Test Item',
                    materialCode: '12345AS',
                    unit: {
                        name: 'EA'
                    }
                },
                quantity: 100,
                quantityLeft: 100
            },
            item: {
                id: 1,
                description: 'Test Item',
                materialCode: '12345AS',
                unit: {
                    name: 'EA'
                }
            },
            quantity: 100,
            netPrice: 10.00,
            netValue: 1000.00,
            issueDate: '2014-10-02',
            deliveryDate: '2014-10-02',
            distributionplannodeSet: [{id: 1}]
        };

        stubPurchaseOrderItem = {
            id: 1,
            purchaseOrder: stubPurchaseOrder.id,
            itemNumber: 10,
            quantity: '700.00',
            value: '3436.82',
            salesOrderItem: stubSalesOrderItem
        };

        stubReleaseOrderItem = {
            id: 1,
            release_order: stubReleaseOrder.id,
            item: 10,
            item_number: 10,
            quantity: '700.00',
            value: '3436.82',
            purchaseOrderItem: stubPurchaseOrderItem
        };
    });

    var setUp = function (routeParams) {
        mockIPService = jasmine.createSpyObj('mockIPService', ['loadAllDistricts']);
        mockConsigneeService = jasmine.createSpyObj('mockConsigneeService', ['all']);
        mockOptionService = jasmine.createSpyObj('mockOptionService', ['receivedOptions', 'qualityOptions', 'satisfiedOptions']);
        mockPurchaseOrderService = jasmine.createSpyObj('mockPurchaseOrderService', ['get']);
        mockPurchaseOrderItemService = jasmine.createSpyObj('mockPurchaseOrderService', ['get']);
        mockReleaseOrderService = jasmine.createSpyObj('mockReleaseOrderService', ['get']);
        mockReleaseOrderItemService = jasmine.createSpyObj('mockReleaseOrderService', ['get']);
        mockDistributionPlanService = jasmine.createSpyObj('mockDistributionPlanService', ['create']);
        mockDistributionPlanNodeService = jasmine.createSpyObj('mockDistributionPlanNodeService', ['getNodeResponse']);
        mockSalesOrderItemService = jasmine.createSpyObj('mockSalesOrderItemService', ['get']);
        mockSalesOrderService = jasmine.createSpyObj('mockSalesOrderService', ['get']);
        mockToastProvider = jasmine.createSpyObj('mockToastProvider', ['create']);

        inject(function ($controller, $rootScope, $location, $sorter, $timeout, $q) {
            q = $q;
            deferredDistrictPromise = $q.defer();
            deferredConsigneePromise = $q.defer();
            deferredOptionPromise = $q.defer();
            deferredPurchaseOrderPromise = $q.defer();
            deferredPurchaseOrderItemPromise = $q.defer();
            deferredReleaseOrderPromise = $q.defer();
            deferredReleaseOrderItemPromise = $q.defer();
            deferredLineItemPromise = $q.defer();
            deferredDistributionPlanPromise = $q.defer();
            deferredDistributionPlanNodePromise = $q.defer();
            deferredNodeResponsePromise = $q.defer();
            deferredSalesOrderItemPromise = $q.defer();
            deferredSalesOrderPromise = $q.defer();
            mockIPService.loadAllDistricts.and.returnValue(deferredDistrictPromise.promise);
            mockConsigneeService.all.and.returnValue(deferredConsigneePromise.promise);
            mockOptionService.receivedOptions.and.returnValue(deferredOptionPromise.promise);
            mockOptionService.qualityOptions.and.returnValue(deferredOptionPromise.promise);
            mockOptionService.satisfiedOptions.and.returnValue(deferredOptionPromise.promise);
            mockPurchaseOrderService.get.and.returnValue(deferredPurchaseOrderPromise.promise);
            mockPurchaseOrderItemService.get.and.returnValue(deferredPurchaseOrderItemPromise.promise);
            mockReleaseOrderService.get.and.returnValue(deferredReleaseOrderPromise.promise);
            mockReleaseOrderItemService.get.and.returnValue(deferredReleaseOrderItemPromise.promise);
            mockDistributionPlanService.create.and.returnValue(deferredDistributionPlanPromise.promise);
            mockDistributionPlanNodeService.getNodeResponse.and.returnValue(deferredNodeResponsePromise.promise);
            mockSalesOrderService.get.and.returnValue(deferredSalesOrderPromise.promise);
            mockSalesOrderItemService.get.and.returnValue(deferredSalesOrderItemPromise.promise);
            location = $location;
            scope = $rootScope.$new();

            spyOn(angular, 'element').and.callFake(function () {
                return {
                    modal: jasmine.createSpy('modal').and.callFake(function (status) {
                        return status;
                    }),
                    hasClass: jasmine.createSpy('hasClass').and.callFake(function (status) {
                        return status;
                    }),
                    removeClass: jasmine.createSpy('removeClass').and.callFake(function (status) {
                        return status;
                    })
                };
            });

            $controller('ManualReportingDetailsController',
                {
                    $scope: scope,
                    $q: q,
                    $location: location,
                    $routeParams: routeParams,
                    IPService: mockIPService,
                    ConsigneeService: mockConsigneeService,
                    OptionService: mockOptionService,
                    PurchaseOrderService: mockPurchaseOrderService,
                    PurchaseOrderItemService: mockPurchaseOrderItemService,
                    ReleaseOrderService: mockReleaseOrderService,
                    ReleaseOrderItemService: mockReleaseOrderItemService,
                    ngToast: mockToastProvider,
                    DistributionPlanService: mockDistributionPlanService,
                    DistributionPlanNodeService: mockDistributionPlanNodeService,
                    SalesOrderItemService: mockSalesOrderItemService,
                    SalesOrderService: mockSalesOrderService
                });
        });
    };

    describe('when initialized', function () {
        describe('loading initial lists', function () {
            beforeEach(function () {
                setUp({});
            });

            it('should load district list on the scope', function () {
                var stubDistricts = {data: ['Kampala']};
                var expectedDistricts = [{id: 'Kampala', name: 'Kampala'}];
                deferredDistrictPromise.resolve(stubDistricts);
                scope.initialize();
                scope.$apply();

                expect(scope.districts).toEqual(expectedDistricts);
            });

            it('should load received responses option list on the scope', function () {
                var stubOptions = [{id: 1, text: 'Test Received Option'}, {id: 35, text: 'No'}];
                var expectedReceivedOptions = [{id: 1, name: 'Test Received Option'}, {id: 35, name: 'No'}];
                deferredOptionPromise.resolve(stubOptions);
                scope.initialize();
                scope.$apply();

                expect(scope.receivedResponsesList).toEqual(expectedReceivedOptions);
                expect(scope.receivedNoId).toEqual(35);
            });

            it('should load quality responses option list on the scope', function () {
                var stubOptions = [{id: 1, text: 'Test Quality Option'}];
                var expectedQualityOptions = [{id: 1, name: 'Test Quality Option'}];
                deferredOptionPromise.resolve(stubOptions);
                scope.initialize();
                scope.$apply();

                expect(scope.qualityResponsesList).toEqual(expectedQualityOptions);
            });

            it('should load satisfied responses option list on the scope', function () {
                var stubOptions = [{id: 1, text: 'Test Satisfied Option'}];
                var expectedSatisfiedOptions = [{id: 1, name: 'Test Satisfied Option'}];
                deferredOptionPromise.resolve(stubOptions);
                scope.initialize();
                scope.$apply();

                expect(scope.receivedResponsesList).toEqual(expectedSatisfiedOptions);
            });
        });

        describe('with purchase order', function () {

            var stubPO = {
                id: 1,
                orderNumber: orderId,
                salesOrder: 1,
                date: '2014-10-06',
                purchaseorderitemSet: [{id: 1, salesOrderItem: 1}],
                programme: programmeName
            };

            var stubSOItem = {
                id: 1,
                salesOrder: 1,
                item: {
                    id: 1,
                    description: 'Test Item',
                    materialCode: '12345AS',
                    unit: {
                        name: 'EA'
                    }
                },
                quantity: 100,
                netPrice: 10.00,
                netValue: 1000.00,
                issueDate: '2014-10-02',
                deliveryDate: '2014-10-02',
                distributionplannodeSet: [{id: 1}]
            };

            beforeEach(function () {
                setUp({purchaseOrderId: 1});
            });

            it('should set purchase order details on the scope', function () {

                deferredPurchaseOrderPromise.resolve(stubPO);
                deferredSalesOrderPromise.resolve(stubSalesOrder);
                deferredSalesOrderItemPromise.resolve(stubSOItem);
                scope.initialize();
                scope.$apply();

                expect(scope.reportingDetailsTitle).toEqual('Report By PO:');
                expect(scope.orderNumber).toEqual(stubPO.orderNumber);
                expect(scope.orderProgramme).toEqual(stubPO.programme);
                expect(scope.salesOrder).toEqual(stubSalesOrder);
            });

            it('should set documentItems on the scope', function () {
                var expectedDocumentItem = {
                    description: stubSOItem.item.description,
                    materialCode: stubSOItem.item.materialCode,
                    quantity: stubSOItem.quantity,
                    unit: stubSOItem.item.unit,
                    salesOrderItem: stubSOItem,
                    distributionplannodes: stubSOItem.distributionplannodeSet
                };

                deferredPurchaseOrderPromise.resolve(stubPO);
                deferredSalesOrderItemPromise.resolve(stubSOItem);
                scope.initialize();
                scope.$apply();

                expect(scope.documentItems).toEqual([expectedDocumentItem]);
            });
        });

        describe('with release order', function () {
            beforeEach(function () {
                setUp({releaseOrderId: 1});
            });

            it('should set release order details on the scope', function () {
                deferredReleaseOrderPromise.resolve(stubReleaseOrder);
                deferredReleaseOrderItemPromise.resolve(stubReleaseOrderItem);
                deferredSalesOrderPromise.resolve(stubSalesOrder);
                scope.initialize();
                scope.$apply();

                expect(scope.reportingDetailsTitle).toEqual('Report By Waybill:');
                expect(scope.orderNumber).toEqual(stubReleaseOrder.waybill);
                expect(scope.orderProgramme).toEqual(stubReleaseOrder.programme);
                expect(scope.salesOrder).toEqual(stubSalesOrder);
            });

            it('should set documentItems on the scope', function () {
                var expectedDocumentItem = {
                    description: stubSalesOrderItem.item.description,
                    materialCode: stubSalesOrderItem.item.materialCode,
                    quantity: stubReleaseOrderItem.quantity,
                    unit: stubSalesOrderItem.item.unit.name,
                    salesOrderItem: stubSalesOrderItem,
                    distributionplannodes: stubSalesOrderItem.distributionplannodeSet
                };

                deferredReleaseOrderPromise.resolve(stubReleaseOrder);
                deferredReleaseOrderItemPromise.resolve(stubReleaseOrderItem);
                scope.initialize();
                scope.$apply();

                expect(scope.documentItems).toEqual([expectedDocumentItem]);
            });
        });
    });

    describe('when selecting document item', function () {
        beforeEach(function () {
            setUp({});
            scope.selectedDocumentItem = {
                description: stubSalesOrderItem.item.description,
                materialCode: stubSalesOrderItem.item.materialCode,
                quantity: stubReleaseOrderItem.quantity,
                unit: stubSalesOrderItem.item.unit.name,
                salesOrderItem: stubSalesOrderItem,
                distributionplannodes: stubSalesOrderItem.distributionplannodeSet
            };

            nodeResponse = {
                node: {
                    plan_id: 1,
                    contact_person_id: 1,
                    consignee: 1,
                    id: 1,
                    location: 'Kampala'
                },
                node_run_id: 1,
                responses: {
                    amountReceived: {
                        id: 1,
                        value: 80,
                        formatted_value: '80'
                    },
                    satisfiedWithProduct: {
                        id: 2,
                        value: 1,
                        formatted_value: 'Yes'
                    },
                    productReceived: {
                        id: 3,
                        value: 3,
                        formatted_value: 'Yes'
                    },
                    dateOfReceipt: {
                        id: 4,
                        value: '04/10/2014',
                        formatted_value: '04/10/2014'
                    }
                }
            };
        });

        it('should set responses on the scope', function () {
            var expectedResponseDetails = [{
                nodeRunId: nodeResponse.node_run_id,
                consignee: nodeResponse.node.consignee,
                endUser: nodeResponse.node.contact_person_id,
                location: nodeResponse.node.location,
                received: nodeResponse.responses.productReceived.value,
                received_answer: nodeResponse.responses.productReceived,
                quantity: nodeResponse.responses.amountReceived.formatted_value,
                quantity_answer: nodeResponse.responses.amountReceived,
                dateReceived: nodeResponse.responses.dateOfReceipt.formatted_value,
                dateReceived_answer: nodeResponse.responses.dateOfReceipt,
                quality: '',
                quality_answer: undefined,
                satisfied: nodeResponse.responses.satisfiedWithProduct.value,
                satisfied_answer: nodeResponse.responses.satisfiedWithProduct,
                remark: '',
                remark_answer: undefined
            }];

            deferredNodeResponsePromise.resolve(nodeResponse);
            scope.selectDocumentItem();
            scope.$apply();

            expect(scope.distributionPlanId).toEqual(nodeResponse.plan_id);
            expect(scope.responses).toEqual(expectedResponseDetails);
        });

        it('should set a distribution plan on the scope if responses exists', function () {
            deferredNodeResponsePromise.resolve(nodeResponse);
            scope.selectDocumentItem();
            scope.$apply();

            expect(scope.distributionPlanId).toEqual(nodeResponse.plan_id);
        });
    });

    describe('when responses list on scope changes, ', function () {
        describe('disabling save with invalidResponses field', function () {
            var invalidResponse;
            var validResponse = {
                consignee: 4,
                endUser: '5444d433ec8e8257ae48dc73',
                location: 'Adjumani',
                received: 'Yes',
                quantity: 0,
                dateReceived: '',
                quality: '',
                satisfied: '',
                remark: ''
            };

            beforeEach(function () {
                scope.responses = [];
                scope.$apply();
            });

            it('sets the invalidLineItems field to false when there are no invalid responses', function () {
                scope.invalidResponses = false;
                scope.responses.push(validResponse);
                scope.$apply();

                expect(scope.invalidResponses).toBeFalsy();
            });

            it('sets the invalidLineItems field to true when there are responses with no consignee', function () {
                invalidResponse = angular.copy(validResponse);
                delete invalidResponse.consignee;
                scope.responses.push(invalidResponse);
                scope.$apply();

                expect(scope.invalidResponses).toBeTruthy();
            });

            it('sets the invalidLineItems field to true when there are responses with no end user', function () {
                invalidResponse = angular.copy(validResponse);
                invalidResponse.endUser = '';
                scope.responses.push(invalidResponse);
                scope.$apply();

                expect(scope.invalidResponses).toBeTruthy();
            });

            it('sets the invalidLineItems field to true when there are responses with no received value', function () {
                invalidResponse = angular.copy(validResponse);
                invalidResponse.received = '';
                scope.responses.push(invalidResponse);
                scope.$apply();

                expect(scope.invalidResponses).toBeTruthy();
            });

            it('sets the invalidLineItems field to true when there are responses with invalid quantity fields', function () {
                invalidResponse = angular.copy(validResponse);
                invalidResponse.quantity = -1;
                scope.responses.push(invalidResponse);
                scope.$apply();

                expect(scope.invalidResponses).toBeTruthy();
            });
        });
    });

    describe('when saving responses', function () {
        var programmeId, distributionPlan;

        beforeEach(function () {
            setUp({});
            distributionPlan = {id: 1};
            programmeId = 42;
            deferredDistributionPlanPromise.resolve(distributionPlan);

            scope.salesOrder = {programme: {id: programmeId}};
            scope.$apply();
        });

        describe('and the report is successfully saved, ', function () {
            it('a toast confirming the save action should be created', function () {
                scope.saveResponses();
                scope.$apply();

                var expectedToastArguments = {
                    content: 'Report Saved!',
                    class: 'success',
                    maxNumber: 1,
                    dismissOnTimeout: true
                };
                expect(mockToastProvider.create).toHaveBeenCalledWith(expectedToastArguments);
            });

            it('puts a promise on the scope to notify the ui that saving is done', function () {
                scope.saveResponses();
                scope.$apply();

                expect(scope.saveReponsesPromise).toBeTruthy();
            });
        });

        describe('and a plan for the sales order item has not been saved, ', function () {
            it('a distribution plan should be created', function () {
                scope.saveResponses();
                scope.$apply();

                expect(mockDistributionPlanService.create).toHaveBeenCalledWith({programme: programmeId});
            });

            it('the created distribution plan should be put on the scope', function () {
                scope.saveResponses();
                scope.$apply();

                expect(scope.distributionPlanId).toEqual(distributionPlan.id);
            });
        });

        describe('and a plan exists for the current responses, ', function () {
            it('a distribution plan should not be created', function () {
                scope.distributionPlanId = 1;
                scope.$apply();

                scope.saveResponses();
                scope.$apply();

                expect(mockDistributionPlanService.create).not.toHaveBeenCalled();
            });
        });

        describe('when saving an existing response, ', function () {
//            var responseItem;
//            var distributionDateFormatedForSave = '2014-2-3';
//
//            beforeEach(function () {
//                responseItem = {
//                    newResponse: false,
//                    consignee: 1,
//                    endUser: '0489284',
//                    location: 'Kampala',
//                    received: 'Yes',
//                    received_answer: responseItem.responses.productReceived,
//                    quantity: 10,
//                    quantity_answer: responseItem.responses.amountReceived,
//                    dateReceived: '02/03/2014',
//                    dateReceived_answer: responseItem.responses.dateOfReceipt,
//                    quality: 3,
//                    quality_answer: responseItem.responses.qualityOfProduct,
//                    satisfied: 'Yes',
//                    satisfied_answer: responseItem.responses.satisfiedWithProduct,
//                    remark: 'This is a remark'
//                };
//
//                scope.responses = [responseItem];
//                scope.track = true;
//                scope.$apply();
//            });
        });
    });

    describe('when add responses', function () {
        beforeEach(function () {
            setUp({});
        });

        it('should have document selected with default values', function () {
            var expectedResponse = [{
                nodeRunId: '',
                consignee: '',
                endUser: '',
                location: '',
                received: '',
                received_answer: undefined,
                quantity: 0,
                quantity_answer: undefined,
                dateReceived: '',
                dateReceived_answer: undefined,
                quality: '',
                quality_answer: undefined,
                satisfied: '',
                satisfied_answer: undefined,
                remark: '',
                remark_answer: undefined
            }];
            scope.responses = [];
            scope.addResponse();
            scope.$apply();
            expect(scope.responses).toEqual(expectedResponse);
        });

        it('should set the date picker', function () {
            scope.responses = [];
            scope.addResponse();
            scope.$apply();
            expect(scope.datepicker).toEqual({0: false});
        });
    });

    describe('adding a contact', function () {
        describe('with invalid fields', function () {
            it('should be invalid when no number is supplied', function () {
                scope.contact = {
                    firstName: 'Dude',
                    lastName: 'Awesome',
                    phone: ''
                };
                scope.$apply();

                expect(scope.invalidContact(scope.contact)).toBeTruthy();
            });

            it('should be invalid when no first name is supplied', function () {
                scope.contact = {
                    firstName: '',
                    lastName: 'Awesome',
                    phone: '+256782555444'
                };
                scope.$apply();

                expect(scope.invalidContact(scope.contact)).toBeTruthy();
            });

            it('should be invalid when no last name is supplied', function () {
                scope.contact = {
                    firstName: 'Dudette',
                    lastName: '',
                    phone: '+256782555444'
                };
                scope.$apply();

                expect(scope.invalidContact(scope.contact)).toBeTruthy();
            });
        });

        describe('with valid fields', function () {
            it('should be valid when full name and phone number are supplied', function () {
                scope.contact = {
                    firstName: 'Dudette',
                    lastName: 'Awesome',
                    phone: '+256782555444'
                };
                scope.$apply();

                expect(scope.invalidContact(scope.contact)).toBeFalsy();
            });
        });
    });
});