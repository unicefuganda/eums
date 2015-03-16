'use strict';

angular.module('ManualReportingDetails', ['ngTable', 'siTable', 'eums.ip', 'Consignee', 'Option', 'PurchaseOrder', 'PurchaseOrderItem', 'ReleaseOrder', 'ReleaseOrderItem', 'ngToast', 'Contact', 'DistributionPlanLineItem'])
    .controller('ManualReportingDetailsController', function ($scope, $q, $location, $routeParams, IPService, ConsigneeService, OptionService, PurchaseOrderService, PurchaseOrderItemService, ReleaseOrderService, ReleaseOrderItemService, ngToast, ContactService, DistributionPlanLineItemService) {
        $scope.datepicker = {};
        $scope.contact = {};
        $scope.responseIndex = '';
        $scope.response = {};
        $scope.documentItems = [];
        $scope.responses = [];
        $scope.receivedResponsesList = [{'id': 'Yes', 'name': 'Yes'},
                                        {'id': 'No', 'name': 'No'}];
        $scope.satisfiedResponsesList = [{'id': 'Yes', 'name': 'Yes'},
                                        {'id': 'No', 'name': 'No'}];

        function createToast(message, klass) {
            ngToast.create({
                content: message,
                class: klass,
                maxNumber: 1,
                dismissOnTimeout: true
            });
        }

        function showLoadingModal(show){
            if (show && !angular.element('#loading').hasClass('in')){
                angular.element('#loading').modal();
            }
            else if (!show){
                 angular.element('#loading').modal('hide');
                 angular.element('#loading.modal').removeClass('in');
            }
        }

        function loadDistricts(){
            IPService.loadAllDistricts().then(function (response) {
                $scope.districts = response.data.map(function (district) {
                    return {id: district, name: district};
                });
            });
        }

        function loadConsignees(){
            ConsigneeService.fetchConsignees().then(function (consignees) {
                $scope.consignees = consignees;
            });
        }

        function loadQualityResponsesList(){
            $scope.qualityResponsesList = [];
            OptionService.qualityOptions().then(function (response) {
                response.forEach(function (response){
                    $scope.qualityResponsesList.push({id: response.id, name: response.text});
                });
            });
        }

        function loadLists(){
             loadDistricts();
             loadConsignees();
             loadQualityResponsesList();
        }

        function loadPurchaseOrderItems(){
            $scope.reportingDetailsTitle = 'Report By PO:';

            PurchaseOrderService.getPurchaseOrder($routeParams.purchaseOrderId).then(function (response) {
                $scope.orderNumber = response.order_number;
                $scope.orderProgramme = response.programme;
                $scope.salesOrder = response.sales_order;

                var purchaseOrderItemSetPromises = [];
                response.purchaseorderitem_set.forEach(function (purchaseOrderItem) {
                    purchaseOrderItemSetPromises.push(
                        PurchaseOrderItemService.getPurchaseOrderItem(purchaseOrderItem).then(function (result) {
                        var formattedDocumentItem = {
                            description: result.sales_order_item.item.description,
                            materialCode: result.sales_order_item.item.material_code,
                            quantity: result.quantity ? result.quantity : result.sales_order_item.quantity,
                            unit: result.sales_order_item.item.unit.name,
                            sales_order_item: result.sales_order_item,
                            distributionplanlineitems: result.sales_order_item.distributionplanlineitem_set
                        };
                        $scope.documentItems.push(formattedDocumentItem);
                    }));
                });

                $q.all(purchaseOrderItemSetPromises).then( function(){
                    showLoadingModal(false);
                });
            });
        }

        function loadReleaseOrderItems(){
            $scope.reportingDetailsTitle = 'Report By Waybill:';

            ReleaseOrderService.getReleaseOrder($routeParams.releaseOrderId).then(function (response) {
                $scope.orderNumber = response.waybill;
                $scope.orderProgramme = response.programme;
                $scope.salesOrder = response.sales_order;

                var releaseOrderItemSetPromises = [];
                response.releaseorderitem_set.forEach(function (releaseOrderItem) {
                    releaseOrderItemSetPromises.push(
                        ReleaseOrderItemService.getReleaseOrderItem(releaseOrderItem).then(function (result) {
                        var formattedDocumentItem = {
                            description: result.purchase_order_item.sales_order_item.item.description,
                            materialCode: result.purchase_order_item.sales_order_item.item.material_code,
                            quantity: result.quantity ? result.quantity : result.purchase_order_item.sales_order_item.quantity,
                            unit: result.purchase_order_item.sales_order_item.item.unit.name,
                            sales_order_item: result.purchase_order_item.sales_order_item,
                            distributionplanlineitems: result.purchase_order_item.sales_order_item.distributionplanlineitem_set
                        };
                        $scope.documentItems.push(formattedDocumentItem);
                    }));
                });

                $q.all(releaseOrderItemSetPromises).then( function(){
                    showLoadingModal(false);
                });
            });
        }

        $scope.initialize = function () {
             showLoadingModal(true);
             loadLists();
             if($routeParams.purchaseOrderId){
                 loadPurchaseOrderItems();
             }
             else{
                 loadReleaseOrderItems();
             }
        };

        $scope.addContact = function (responseIndex, responseDetails) {
            $scope.$parent.responseIndex = responseIndex;
            $scope.$parent.response = responseDetails;
            $('#add-contact-modal').modal();
        };

        $scope.saveContact = function () {
            ContactService
                .addContact($scope.contact)
                .then(function (contactResponse) {
                    $('#add-contact-modal').modal('hide');

                    var contact = contactResponse.data;
                    var contactInput = $('#contact-select-' + $scope.responseIndex);
                    var contactSelect2Input = contactInput.siblings('div').find('a span.select2-chosen');
                    contactSelect2Input.text(contact.firstName + ' ' + contact.lastName);

                    contactInput.val(contact._id);
                    $scope.response.endUser = contact._id;

                    $scope.contact = {};
                }, function (response) {
                    createToast(response.data.error, 'danger');
                });
        };

        $scope.invalidContact = function (contact) {
            return !(contact.firstName && contact.lastName && contact.phone);
        };

        $scope.addRemark = function (responseIndex, responseDetails) {
            $scope.responseIndex = responseIndex;
            $scope.response = responseDetails;
            $('#add-remark-modal').modal();
        };


        $scope.selectDocumentItem = function () {
            showLoadingModal(true);
            var responseItems = [];

            var distributionPlanItems = $scope.selectedDocumentItem.distributionplanlineitems;
            var responsePromises = [];
            distributionPlanItems.forEach(function (planItemId) {
                responsePromises.push(
                    DistributionPlanLineItemService.getLineItemResponse(planItemId).then(function (response) {
                        if(!_.isEmpty(response)){
                            responseItems.push(response);
                        }
                    })
                );
            });

            $q.all(responsePromises).then( function(){
                setResponseLineItems($scope.selectedDocumentItem, responseItems);
                showLoadingModal(false);
            });
        };

        function setDistributionPlan(responseItem){
           if(_.isEmpty($scope.distributionPlanId)){
               $scope.distributionPlanId = responseItem.node.plan_id;
           }
        }

        var setResponseLineItems = function (selectedDocumentItem, responseItems) {
            $scope.responses = [];
            responseItems.forEach(function (responseItem) {
               setDistributionPlan(responseItem);
               var responseItemDetails =  {
                    newResponse: false,
                    consignee: responseItem.node.consignee,
                    endUser: responseItem.node.contact_person_id,
                    location: responseItem.node.location,
                    received: responseItem.responses.productReceived ? 'Yes' : 'No',
                    received_answer: responseItem.responses.productReceived,
                    quantity: responseItem.responses.amountReceived ? responseItem.responses.amountReceived.formatted_value : 0,
                    quantity_answer: responseItem.responses.amountReceived,
                    dateReceived: responseItem.responses.dateOfReceipt ? responseItem.responses.dateOfReceipt.formatted_value : '',
                    dateReceived_answer: responseItem.responses.dateOfReceipt,
                    quality: responseItem.responses.qualityOfProduct ? responseItem.responses.qualityOfProduct.value : '',
                    quality_answer: responseItem.responses.qualityOfProduct,
                    satisfied: responseItem.responses.satisfiedWithProduct ? 'Yes' : 'No',
                    satisfied_answer: responseItem.responses.satisfiedWithProduct,
                    remark: responseItem.line_item.remark
                };

               $scope.responses.push(responseItemDetails);
            });
        };

        function setDatePickers(){
            $scope.datepicker = {};
            $scope.responses.forEach(function (item, index) {
                $scope.datepicker[index] = false;
            });
        }

        $scope.addResponse = function () {
            var newResponseItem = {
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
            };

            $scope.responses.push(newResponseItem);
            setDatePickers();
        };

        function invalidResponseFields(response) {
            return !response.consignee || !response.endUser || !response.location  || !response.received || response.quantity < 0;
        }

        function anyInvalidResponses(responseItems) {
            var responsesWithInvalidFields = responseItems.filter(function (response) {
                return invalidResponseFields(response);
            });
            return responsesWithInvalidFields.length > 0;
        }

        $scope.$watch('responses', function (responseItems) {
            if(isNaN($scope.invalidResponses) && responseItems.length){
                $scope.invalidResponses = true;
                return;
            }

            if (responseItems.length) {
                $scope.invalidResponses = anyInvalidResponses(responseItems);
            }
        }, true);

        $scope.saveResponses = function () {
        };

//        var formatDateForSave = function (date) {
//            return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
//        };
    })
    .directive('searchContacts', function (ContactService, $timeout) {
        function formatResponse(data) {
            return data.map(function (contact) {
                return {
                    id: contact._id,
                    text: contact.firstName + ' ' + contact.lastName
                };
            });
        }

        return {
            restrict: 'A',
            scope: true,
            require: 'ngModel',
            link: function (scope, element, _, ngModel) {

                element.select2({
                    minimumInputLength: 1,
                    width: '150px',
                    query: function (query) {
                        var data = {results: []};
                        ContactService.getContactsBySearchQuery(query.term).then(function (foundContacts) {
                            data.results = formatResponse(foundContacts);
                            query.callback(data);
                        });
                    },
                    initSelection: function (element, callback) {
                        $timeout(function () {
                            var modelValue = ngModel.$modelValue;
                            if (modelValue) {
                                ContactService.getContactById(modelValue).then(function (contact) {
                                    if (contact._id) {
                                        callback({
                                            id: contact._id,
                                            text: contact.firstName + ' ' + contact.lastName
                                        });
                                    }
                                });
                            }
                        });
                    }
                });

                element.change(function () {
                    ngModel.$setViewValue(element.select2('data').id);
                    scope.$apply();
                });
            }
        };
    })
    .directive('onlyDigits', function () {
        return {
            require: 'ngModel',
            restrict: 'A',
            link: function (scope, element, attr, ngModelCtrl) {
                function inputValue(val) {
                    if (val) {
                        var digits = val.toString().replace(/[^0-9]/g, '');

                        if (digits.toString() !== val.toString()) {
                            ngModelCtrl.$setViewValue(digits);
                            ngModelCtrl.$render();
                        }
                        return parseInt(digits, 10);
                    }
                    return undefined;
                }

                ngModelCtrl.$parsers.push(inputValue);
            }
        };
    });
