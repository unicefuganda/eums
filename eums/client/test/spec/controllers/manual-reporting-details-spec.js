describe('ManualReportingDetailsController', function () {
    beforeEach(module('ManualReportingDetails'));

     var mockIPService, mockConsigneeService, mockOptionService, mockPurchaseOrderService, mockPurchaseOrderItemService,
         mockReleaseOrderService, mockReleaseOrderItemService, mockDistributionPlanLineItemService;
     var deferredDistrictPromise, deferredConsigneePromise, deferredOptionPromise, deferredPurchaseOrderPromise,
         deferredPurchaseOrderItemPromise, deferredReleaseOrderPromise, deferredReleaseOrderItemPromise,
         deferredLineItemPromise;
     var scope, q, mockToastProvider, location;
     var stubPurchaseOrder, stubReleaseOrder, stubSalesOrderItem, stubPurchaseOrderItem, stubReleaseOrderItem;
     var orderId = 1,
         salesOrderId = 1,
         programmeName = 'Test Programme';
     var responseItem;


    beforeEach(function () {
        stubPurchaseOrder = {
            id: 1,
            order_number: orderId,
            sales_order: salesOrderId,
            date: '2014-10-06',
            purchaseorderitem_set: [1],
            programme: programmeName
        };

        stubReleaseOrder = {
            id: 1,
            order_number: orderId,
            delivery_date: '2014-10-06',
            description: 'Midwife Supplies',
            consignee: 1,
            waybill: 12,
            sales_order: 1,
            releaseorderitem_set: [1],
            programme: programmeName
        };

        stubSalesOrderItem = {
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
            item: {
                id: 1,
                description: 'Test Item',
                material_code: '12345AS',
                unit: {
                    name: 'EA'
                }
            },
            quantity: 100,
            net_price: 10.00,
            net_value: 1000.00,
            issue_date: '2014-10-02',
            delivery_date: '2014-10-02',
            distributionplanlineitem_set: [1]
        };

        stubPurchaseOrderItem = {
            id: 1,
            purchase_order: stubPurchaseOrder.id,
            item_number: 10,
            quantity: '700.00',
            value: '3436.82',
            sales_order_item: stubSalesOrderItem
        };

        stubReleaseOrderItem = {
            id: 1,
            release_order: stubReleaseOrder.id,
            item: 10,
            item_number: 10,
            quantity: '700.00',
            value: '3436.82',
            purchase_order_item: stubPurchaseOrderItem
        };
    });

    var setUp = function (routeParams) {
        mockIPService = jasmine.createSpyObj('mockIPService', ['loadAllDistricts']);
        mockConsigneeService = jasmine.createSpyObj('mockConsigneeService', ['fetchConsignees']);
        mockOptionService = jasmine.createSpyObj('mockOptionService', ['qualityOptions']);
        mockPurchaseOrderService = jasmine.createSpyObj('mockPurchaseOrderService', ['getPurchaseOrder']);
        mockPurchaseOrderItemService = jasmine.createSpyObj('mockPurchaseOrderService', ['getPurchaseOrderItem']);
        mockReleaseOrderService = jasmine.createSpyObj('mockReleaseOrderService', ['getReleaseOrder']);
        mockReleaseOrderItemService = jasmine.createSpyObj('mockReleaseOrderService', ['getReleaseOrderItem']);
        mockDistributionPlanLineItemService = jasmine.createSpyObj('mockDistributionPlanLineItemService', ['getLineItemResponse']);
        mockToastProvider = jasmine.createSpyObj('mockToastProvider', ['create']);

        inject(function ($controller, $rootScope, $location, $sorter, $timeout, $q) {
            q = $q;
            deferredDistrictPromise = $q.defer();
            deferredConsigneePromise = $q.defer();
            deferredOptionPromise = $q.defer();
            deferredPurchaseOrderPromise  = $q.defer();
            deferredPurchaseOrderItemPromise = $q.defer();
            deferredReleaseOrderPromise = $q.defer();
            deferredReleaseOrderItemPromise = $q.defer();
            deferredLineItemPromise = $q.defer();
            mockIPService.loadAllDistricts.and.returnValue(deferredDistrictPromise.promise);
            mockConsigneeService.fetchConsignees.and.returnValue(deferredConsigneePromise.promise);
            mockOptionService.qualityOptions.and.returnValue(deferredOptionPromise.promise);
            mockPurchaseOrderService.getPurchaseOrder.and.returnValue(deferredPurchaseOrderPromise.promise);
            mockPurchaseOrderItemService.getPurchaseOrderItem.and.returnValue(deferredPurchaseOrderItemPromise.promise);
            mockReleaseOrderService.getReleaseOrder.and.returnValue(deferredReleaseOrderPromise.promise);
            mockReleaseOrderItemService.getReleaseOrderItem.and.returnValue(deferredReleaseOrderItemPromise.promise);
            mockDistributionPlanLineItemService.getLineItemResponse.and.returnValue(deferredLineItemPromise.promise);
            location = $location;
            scope = $rootScope.$new();

            spyOn(angular, 'element').and.callFake(function () {
                return {
                    modal : jasmine.createSpy('modal').and.callFake(function (status) {
                        return status;
                    }),
                    hasClass : jasmine.createSpy('hasClass').and.callFake(function (status) {
                        return status;
                    }),
                    removeClass : jasmine.createSpy('removeClass').and.callFake(function (status) {
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
                    DistributionPlanLineItemService: mockDistributionPlanLineItemService
                });
        });
    };


    describe('when initialized', function () {
        describe('loading initial lists', function (){
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

            it('should load consignee list on the scope', function () {
                var expectedConsignees = [{id: 1, name: 'Test Consignee'}];
                deferredConsigneePromise.resolve(expectedConsignees);
                scope.initialize();
                scope.$apply();

                expect(scope.consignees).toEqual(expectedConsignees);
            });

            it('should load quality responses list on the scope', function () {
                var stubOptions = [{id: 1, text: 'Test Option'}];
                var expectedQualityOptions = [{id: 1, name: 'Test Option'}];
                deferredOptionPromise.resolve(stubOptions);
                scope.initialize();
                scope.$apply();

                expect(scope.qualityResponsesList).toEqual(expectedQualityOptions);
            });
        });

        describe('with purchase order', function () {
            beforeEach(function () {
                setUp({purchaseOrderId: 1});
            });

            it('should set purchase order details on the scope', function () {
                  deferredPurchaseOrderPromise.resolve(stubPurchaseOrder);
                  scope.initialize();
                  scope.$apply();

                  expect(scope.reportingDetailsTitle).toEqual('Report By PO:');
                  expect(scope.orderNumber).toEqual(stubPurchaseOrder.order_number);
                  expect(scope.orderProgramme).toEqual(stubPurchaseOrder.programme);
            });

            it('should set documentItems on the scope', function () {
                 var expectedDocumentItem = {
                    description: stubSalesOrderItem.item.description,
                    materialCode: stubSalesOrderItem.item.material_code,
                    quantity: stubPurchaseOrderItem.quantity,
                    unit: stubSalesOrderItem.item.unit.name,
                    sales_order_item: stubSalesOrderItem,
                    distributionplanlineitems: stubSalesOrderItem.distributionplanlineitem_set
                 };

                 deferredPurchaseOrderPromise.resolve(stubPurchaseOrder);
                 deferredPurchaseOrderItemPromise.resolve(stubPurchaseOrderItem);
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
                  scope.initialize();
                  scope.$apply();

                  expect(scope.reportingDetailsTitle).toEqual('Report By Waybill:');
                  expect(scope.orderNumber).toEqual(stubReleaseOrder.waybill);
                  expect(scope.orderProgramme).toEqual(stubReleaseOrder.programme);
            });

            it('should set documentItems on the scope', function () {
                 var expectedDocumentItem = {
                    description: stubSalesOrderItem.item.description,
                    materialCode: stubSalesOrderItem.item.material_code,
                    quantity: stubReleaseOrderItem.quantity,
                    unit: stubSalesOrderItem.item.unit.name,
                    sales_order_item: stubSalesOrderItem,
                    distributionplanlineitems: stubSalesOrderItem.distributionplanlineitem_set
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
                    materialCode: stubSalesOrderItem.item.material_code,
                    quantity: stubReleaseOrderItem.quantity,
                    unit: stubSalesOrderItem.item.unit.name,
                    sales_order_item: stubSalesOrderItem,
                    distributionplanlineitems: stubSalesOrderItem.distributionplanlineitem_set
              };

              responseItem = {
                    node: {
                        plan_id: 1,
                        contact_person_id: 1,
                        consignee: 1,
                        id: 1,
                        location: 'Kampala'
                    },
                    line_item: {
                        remark: 'Test remark',
                        id: 1
                    },
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
                            value:'04/10/2014',
                            formatted_value: '04/10/2014'
                        }
                    }
              };
          });

          it('should set responses on the scope', function () {
              var expectedResponseDetails = [{
                    newResponse: false,
                    consignee: responseItem.node.consignee,
                    endUser: responseItem.node.contact_person_id,
                    location: responseItem.node.location,
                    received: 'Yes',
                    received_answer: responseItem.responses.productReceived,
                    quantity: responseItem.responses.amountReceived.formatted_value,
                    quantity_answer: responseItem.responses.amountReceived,
                    dateReceived: responseItem.responses.dateOfReceipt.formatted_value,
                    dateReceived_answer: responseItem.responses.dateOfReceipt,
                    quality: '',
                    quality_answer: undefined,
                    satisfied: 'Yes',
                    satisfied_answer: responseItem.responses.satisfiedWithProduct,
                    remark: responseItem.line_item.remark
              }];

              deferredLineItemPromise.resolve(responseItem);
              scope.selectDocumentItem();
              scope.$apply();

              expect(scope.distributionPlanId).toEqual(responseItem.node.plan_id);
              expect(scope.responses).toEqual(expectedResponseDetails);
          });

          it('should set a distribution plan on the scope if responses exists', function () {
              deferredLineItemPromise.resolve(responseItem);
              scope.selectDocumentItem();
              scope.$apply();

              expect(scope.distributionPlanId).toEqual(responseItem.node.plan_id);
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

//    describe('when save responses', function () {
//        it('should set the scope variable to true', function () {
//            scope.saveResponses();
//            scope.$apply();
//            expect(scope.reportSaved).toBeTruthy();
//        });
//
//        it('should set the scope variable to false when time out happens', function(){
//            scope.saveResponses();
//            timeout.flush();
//            scope.$apply();
//
//            expect(scope.reportSaved).toBeFalsy();
//        });
//    });

    describe('when add responses', function () {
        beforeEach(function () {
            setUp({});
        });

        it('should have document selected with default values', function () {
            var expectedResponse = [{
                newResponse: true,
                consignee: '',
                endUser: '',
                location: '',
                received: '',
                quantity: 0,
                dateReceived: '',
                quality: '',
                satisfied: '',
                remark: ''
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