'use strict';

angular.module('ManualReportingDetails', ['ngTable', 'siTable', 'eums.ip', 'Consignee', 'Option', 'PurchaseOrder',
        'PurchaseOrderItem', 'ReleaseOrder', 'ReleaseOrderItem', 'ngToast', 'Contact',
        'Delivery', 'DeliveryNode', 'Answer', 'Question', 'Run', 'SalesOrder'])
    .controller('ManualReportingDetailsController', function ($scope, $q, $location, $routeParams, IPService, ConsigneeService,
                                                              OptionService, PurchaseOrderService, PurchaseOrderItemService, ReleaseOrderService,
                                                              ReleaseOrderItemService, ngToast, ContactService, DeliveryService,
                                                              DeliveryNodeService, AnswerService, QuestionService, RunService,
                                                              SalesOrderService, SalesOrderItemService) {
        $scope.datepicker = {};
        $scope.contact = {};
        $scope.responseIndex = '';
        $scope.response = {};
        $scope.documentItems = [];
        $scope.responses = [];

        function createToast(message, klass) {
            ngToast.create({
                content: message,
                class: klass,
                maxNumber: 1,
                dismissOnTimeout: true
            });
        }

        function showLoadingModal(show) {
            if (show && !angular.element('#loading').hasClass('in')) {
                angular.element('#loading').modal();
            }
            else if (!show) {
                angular.element('#loading').modal('hide');
                angular.element('#loading.modal').removeClass('in');
            }
        }

        function loadDistricts() {
            IPService.loadAllDistricts().then(function (response) {
                $scope.districts = response.data.map(function (district) {
                    return {id: district, name: district};
                });
            });
        }

        function loadReceivedResponsesList() {
            $scope.receivedResponsesList = [];
            var itemReceivedOptionsService = OptionService.getService('item', 'received');
            itemReceivedOptionsService().then(function (response) {
                response.forEach(function (response) {
                    if (response.text === 'No') {
                        $scope.receivedNoId = response.id;
                    }
                    $scope.receivedResponsesList.push({id: response.id, name: response.text});
                });
            });
        }

        function loadQualityResponsesList() {
            $scope.qualityResponsesList = [];
            var itemQualityOptionsService = OptionService.getService('item', 'quality');
            itemQualityOptionsService().then(function (response) {
                response.forEach(function (response) {
                    $scope.qualityResponsesList.push({id: response.id, name: response.text});
                });
            });
        }

        function loadSatisfiedResponsesList() {
            $scope.satisfiedResponsesList = [];
            var itemSatisfiedOptionsService = OptionService.getService('item', 'satisfied');
            itemSatisfiedOptionsService().then(function (response) {
                response.forEach(function (response) {
                    $scope.satisfiedResponsesList.push({id: response.id, name: response.text});
                });
            });
        }


        function loadLists() {
            loadDistricts();
            loadReceivedResponsesList();
            loadQualityResponsesList();
            loadSatisfiedResponsesList();
        }

        function loadPurchaseOrderItems() {
            $scope.reportingDetailsTitle = 'Report By PO:';

            PurchaseOrderService.get($routeParams.purchaseOrderId, ['purchaseorderitem_set']).then(function (response) {
                $scope.orderNumber = response.orderNumber;
                $scope.orderProgramme = response.programmeName;
                SalesOrderService.get(response.salesOrder, ['programme']).then(function (salesOrder) {
                    $scope.salesOrder = salesOrder;
                });

                var salesOrderItemSetPromises = [];
                response.purchaseorderitemSet.forEach(function (purchaseOrderItem) {
                    salesOrderItemSetPromises.push(SalesOrderItemService.get(purchaseOrderItem.salesOrderItem, ['item', 'distributionplannode_set']).then(function (salesOrderItem) {
                        var formattedDocumentItem = {
                            description: salesOrderItem.item.description,
                            materialCode: salesOrderItem.item.materialCode,
                            quantity: purchaseOrderItem.quantity ? purchaseOrderItem.quantity : salesOrderItem.quantity,
                            unit: salesOrderItem.item.unit.name,
                            salesOrderItem: salesOrderItem,
                            distributionplannodes: salesOrderItem.distributionplannodeSet
                        };
                        $scope.documentItems.push(formattedDocumentItem);
                    }));
                });

                $q.all(salesOrderItemSetPromises).then(function () {
                    showLoadingModal(false);
                });
            });
        }

        function loadReleaseOrderItems() {
            $scope.reportingDetailsTitle = 'Report By Waybill:';

            ReleaseOrderService.get($routeParams.releaseOrderId).then(function (response) {
                $scope.orderNumber = response.waybill;
                $scope.orderProgramme = response.programme;
                SalesOrderService.get(response.salesOrder, ['programme']).then(function (salesOrder) {
                    $scope.salesOrder = salesOrder;
                });


                var releaseOrderItemSetPromises = [];
                response.items.forEach(function (releaseOrderItem) {
                    releaseOrderItemSetPromises.push(
                        ReleaseOrderItemService.get(releaseOrderItem, ['item', 'purchase_order_item']).then(function (result) {
                            var formattedDocumentItem = {
                                description: result.item.description,
                                materialCode: result.item.materialCode,
                                quantity: result.quantity ? result.quantity : result.purchaseOrderItem.quantity,
                                unit: result.item.unit.name,
                                salesOrderItem: result.purchaseOrderItem.salesOrderItem,
                                distributionplannodes: result.purchaseOrderItem.distributionplannodeSet
                            };
                            $scope.documentItems.push(formattedDocumentItem);
                        }));
                });

                $q.all(releaseOrderItemSetPromises).then(function () {
                    showLoadingModal(false);
                });
            });
        }

        $scope.initialize = function () {
            showLoadingModal(true);
            loadLists();
            if ($routeParams.purchaseOrderId) {
                loadPurchaseOrderItems();
            }
            else {
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
                .create($scope.contact)
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
            if (!$scope.selectedDocumentItem) {
                return;
            }

            showLoadingModal(true);
            var responses = [];
            var distributionPlanNodes = $scope.selectedDocumentItem.distributionplannodes;
            var responsePromises = [];
            distributionPlanNodes.forEach(function (node) {
                responsePromises.push(
                    DeliveryNodeService.getNodeResponse(node.id).then(function (response) {
                        if (!_.isEmpty(response)) {
                            responses.push(response);
                        }
                    })
                );
            });

            $q.all(responsePromises).then(function () {
                setResponseNodes($scope.selectedDocumentItem, responses);
                showLoadingModal(false);
            });
        };

        function setDistributionPlan(responseNode) {
            if (_.isEmpty($scope.distributionPlanId)) {
                $scope.distributionPlanId = responseNode.plan_id;
            }
        }

        var setResponseNodes = function (selectedDocumentItem, responseNodes) {
            $scope.responses = [];
            responseNodes.forEach(function (responseNode) {
                setDistributionPlan(responseNode);
                var responseDetails = {
                    runId: responseNode.run_id,
                    consignee: responseNode.node.consignee,
                    endUser: responseNode.node.contact_person_id,
                    location: responseNode.node.location,
                    received: responseNode.responses.productReceived ? responseNode.responses.productReceived.value : '',
                    received_answer: responseNode.responses.productReceived,
                    quantity: responseNode.responses.amountReceived ? responseNode.responses.amountReceived.formatted_value : 0,
                    quantity_answer: responseNode.responses.amountReceived,
                    dateReceived: responseNode.responses.dateOfReceipt ? responseNode.responses.dateOfReceipt.formatted_value : '',
                    dateReceived_answer: responseNode.responses.dateOfReceipt,
                    quality: responseNode.responses.qualityOfProduct ? responseNode.responses.qualityOfProduct.value : '',
                    quality_answer: responseNode.responses.qualityOfProduct,
                    satisfied: responseNode.responses.satisfiedWithProduct ? responseNode.responses.satisfiedWithProduct.value : '',
                    satisfied_answer: responseNode.responses.satisfiedWithProduct,
                    remark: responseNode.responses.feedbackAboutDissatisfaction ? responseNode.responses.feedbackAboutDissatisfaction.formatted_value : '',
                    remark_answer: responseNode.responses.feedbackAboutDissatisfaction
                };

                $scope.responses.push(responseDetails);
            });
        };

        function setDatePickers() {
            $scope.datepicker = {};
            $scope.responses.forEach(function (item, index) {
                $scope.datepicker[index] = false;
            });
        }

        $scope.addResponse = function () {
            var newResponseItem = {
                runId: '',
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
            };

            $scope.responses.push(newResponseItem);
            setDatePickers();
        };

        function invalidResponseFields(response) {
            return !response.consignee || !response.endUser || !response.location || !response.received || response.quantity < 0;
        }

        function anyInvalidResponses(responseItems) {
            var responsesWithInvalidFields = responseItems.filter(function (response) {
                return invalidResponseFields(response);
            });
            return responsesWithInvalidFields.length > 0;
        }

        $scope.$watch('responses', function (responseItems) {
            if (isNaN($scope.invalidResponses) && responseItems.length) {
                $scope.invalidResponses = true;
                return;
            }

            if (responseItems.length) {
                $scope.invalidResponses = anyInvalidResponses(responseItems);
            }
        }, true);


        function saveRun(response, nodeId) {
            var run = {
                scheduled_message_task_id: 'MANUAL',
                node: nodeId,
                status: 'completed',
                phone: 'MANUAL'
            };

            return RunService.createRun(run);
        }

        function saveNode(response) {

            var plannedDate = response.dateReceived ? new Date(response.dateReceived) : new Date();

            if (plannedDate.toString() === 'Invalid Date') {
                var planDate = response.dateReceived.split('/');
                plannedDate = new Date(planDate[2], planDate[1] - 1, planDate[0]);
            }

            var node = {
                consignee: response.consignee,
                location: response.location,
                contact_person_id: response.endUser,
                distribution_plan: $scope.distributionPlanId,
                tree_position: 'END_USER',
                parent: null,
                item: $scope.selectedDocumentItem.sales_order_item.id,
                targeted_quantity: response.quantity,
                delivery_date: formatDateForSave(plannedDate),
                remark: '',
                track: false
            };

            return DeliveryNodeService.create(node);
        }

        function saveNewResponse(response) {
            return saveNode(response).then(function (createdNode) {
                return saveRun(response, createdNode.id).then(function (createdRun) {
                    response.runId = createdRun.id;
                    return response;
                });
            });
        }

        function saveResponseReceived(runId, response) {
            var received = response.received;
            var receivedDetails = response.received_answer;

            if (received) {
                if (typeof(receivedDetails) === 'undefined') {
                    return QuestionService.getQuestionByLabel('productReceived').then(function (question) {
                        var answerDetails = {
                            question: question.id,
                            value: received,
                            run: runId
                        };
                        return AnswerService.createMultipleChoiceAnswer(answerDetails).then(function (response_answer) {
                            response.received_answer = response_answer;
                        });
                    });
                }
                else {
                    var updatedValue = {value: received};
                    return AnswerService.updateMultipleChoiceAnswer(receivedDetails.id, updatedValue);
                }
            }
        }

        function saveResponseQuantity(runId, response) {
            var quantity = response.quantity;
            var quantityDetails = response.quantity_answer;

            if (quantity) {
                if (typeof(quantityDetails) === 'undefined') {
                    return QuestionService.getQuestionByLabel('amountReceived').then(function (question) {
                        var answerDetails = {
                            question: question.id,
                            value: quantity,
                            run: runId
                        };
                        return AnswerService.createNumericAnswer(answerDetails).then(function (response_answer) {
                            response.quantity_answer = response_answer;
                        });
                    });
                }
                else {
                    var updatedValue = {value: quantity};
                    return AnswerService.updateNumericAnswer(quantityDetails.id, updatedValue);
                }
            }
        }

        function saveResponseDateReceived(runId, response) {
            var formatReceivedDate = function (date) {
                return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
            };

            var dateReceived = response.dateReceived;
            var dateReceivedDetails = response.dateReceived_answer;

            if (dateReceived) {
                var plannedDate = new Date(response.dateReceived);

                if (plannedDate.toString() === 'Invalid Date') {
                    var planDate = response.dateReceived.split('/');
                    plannedDate = new Date(planDate[2], planDate[1] - 1, planDate[0]);
                }

                if (typeof(dateReceivedDetails) === 'undefined') {
                    return QuestionService.getQuestionByLabel('dateOfReceipt').then(function (question) {
                        var answerDetails = {
                            question: question.id,
                            value: formatReceivedDate(plannedDate),
                            line_item_run: runId
                        };
                        return AnswerService.createTextAnswer(answerDetails).then(function (response_answer) {
                            response.dateReceived_answer = response_answer;
                        });
                    });
                }
                else {
                    var updatedValue = {value: formatReceivedDate(plannedDate)};
                    return AnswerService.updateTextAnswer(dateReceivedDetails.id, updatedValue);
                }
            }
        }

        function saveResponseQuality(runId, response) {
            var quality = response.quality;
            var qualityDetails = response.quality_answer;

            if (quality) {
                if (typeof(qualityDetails) === 'undefined') {
                    return QuestionService.getQuestionByLabel('qualityOfProduct').then(function (question) {
                        var answerDetails = {
                            question: question.id,
                            value: quality,
                            run: runId
                        };
                        return AnswerService.createMultipleChoiceAnswer(answerDetails).then(function (response_answer) {
                            response.quality_answer = response_answer;
                        });
                    });
                }
                else {
                    var updatedValue = {value: quality};
                    return AnswerService.updateMultipleChoiceAnswer(qualityDetails.id, updatedValue);
                }
            }
        }


        function saveResponseSatisfied(runId, response) {
            var satisfied = response.satisfied;
            var satisfiedDetails = response.satisfied_answer;

            if (satisfied) {
                if (typeof(satisfiedDetails) === 'undefined') {
                    return QuestionService.getQuestionByLabel('satisfiedWithProduct').then(function (question) {
                        var answerDetails = {
                            question: question.id,
                            value: satisfied,
                            run: runId
                        };
                        return AnswerService.createMultipleChoiceAnswer(answerDetails).then(function (response_answer) {
                            response.satisfied_answer = response_answer;
                        });
                    });
                }
                else {
                    var updatedValue = {value: satisfied};
                    return AnswerService.updateMultipleChoiceAnswer(satisfiedDetails.id, updatedValue);
                }
            }
        }


        function saveResponseRemark(runId, response) {
            var remark = response.remark;
            var remarkDetails = response.remark_answer;

            if (remark) {
                if (typeof(remarkDetails) === 'undefined') {
                    return QuestionService.getQuestionByLabel('feedbackAboutDissatisfaction').then(function (question) {
                        var answerDetails = {
                            question: question.id,
                            value: remark,
                            run: runId
                        };
                        return AnswerService.createTextAnswer(answerDetails).then(function (response_answer) {
                            response.remark_answer = response_answer;
                        });
                    });
                }
                else {
                    var updatedValue = {value: remark};
                    return AnswerService.updateTextAnswer(remarkDetails.id, updatedValue);
                }
            }
        }

        function saveResponse(response) {
            var saveResponsePartsPromise = [];
            saveResponsePartsPromise.push(saveResponseReceived(response.runId, response));
            saveResponsePartsPromise.push(saveResponseQuantity(response.runId, response));
            saveResponsePartsPromise.push(saveResponseDateReceived(response.runId, response));
            saveResponsePartsPromise.push(saveResponseQuality(response.runId, response));
            saveResponsePartsPromise.push(saveResponseSatisfied(response.runId, response));
            saveResponsePartsPromise.push(saveResponseRemark(response.runId, response));
            var squashedResponsesPartsPromises = $q.all(saveResponsePartsPromise);
            return squashedResponsesPartsPromises;
        }

        function saveResponseItems() {
            var saveResponseItemPromises = [];
            $scope.responses.forEach(function (response) {
                if (response.runId) {
                    saveResponseItemPromises.push(saveResponse(response));
                }
                else {
                    saveNewResponse(response).then(function (newResponse) {
                        saveResponseItemPromises.push(saveResponse(newResponse));
                    });
                }
            });
            var squashedSaveResponsesPromises = $q.all(saveResponseItemPromises);
            $scope.saveReponsesPromise = squashedSaveResponsesPromises;
            return squashedSaveResponsesPromises;
        }

        var saveWithToast = function () {
            saveResponseItems().then(function () {
                createToast('Report Saved!', 'success');
            });
        };

        function createDistributionPlan() {
            return DeliveryService.create({programme: $scope.salesOrder.programme.id})
                .then(function (createdPlan) {
                    return createdPlan;
                });
        }

        $scope.saveResponses = function () {
            if ($scope.distributionPlanId) {
                saveWithToast();
            }
            else {
                createDistributionPlan().then(function (createdPlan) {
                    $scope.distributionPlanId = createdPlan.id;
                    saveWithToast();
                });
            }
        };

        var formatDateForSave = function (date) {
            return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
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
