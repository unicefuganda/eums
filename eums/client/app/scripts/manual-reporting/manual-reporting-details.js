'use strict';

angular.module('ManualReportingDetails', ['ngTable', 'siTable', 'eums.ip', 'Consignee', 'Option', 'PurchaseOrder',
    'PurchaseOrderItem', 'ReleaseOrder', 'ReleaseOrderItem', 'ngToast', 'Contact',
    'DistributionPlan', 'DistributionPlanNode', 'Answer', 'Question', 'NodeRun', 'SalesOrder'])
    .controller('ManualReportingDetailsController', function ($scope, $q, $location, $routeParams, IPService, ConsigneeService, OptionService, PurchaseOrderService, PurchaseOrderItemService, ReleaseOrderService, ReleaseOrderItemService, ngToast, ContactService, DistributionPlanService, DistributionPlanNodeService, AnswerService, QuestionService, NodeRunService, SalesOrderItemService) {
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

        function loadConsignees() {
            ConsigneeService.all().then(function (consignees) {
                $scope.consignees = consignees;
            });
        }

        function loadReceivedResponsesList() {
            $scope.receivedResponsesList = [];
            OptionService.receivedOptions().then(function (response) {
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
            OptionService.qualityOptions().then(function (response) {
                response.forEach(function (response) {
                    $scope.qualityResponsesList.push({id: response.id, name: response.text});
                });
            });
        }

        function loadSatisfiedResponsesList() {
            $scope.satisfiedResponsesList = [];
            OptionService.satisfiedOptions().then(function (response) {
                response.forEach(function (response) {
                    $scope.satisfiedResponsesList.push({id: response.id, name: response.text});
                });
            });
        }


        function loadLists() {
            loadDistricts();
            loadConsignees();
            loadReceivedResponsesList();
            loadQualityResponsesList();
            loadSatisfiedResponsesList();
        }

        function loadPurchaseOrderItems() {
            $scope.reportingDetailsTitle = 'Report By PO:';

            PurchaseOrderService.get($routeParams.purchaseOrderId, ['sales_order', 'purchaseorderitem_set']).then(function (response) {
                $scope.orderNumber = response.orderNumber;
                $scope.orderProgramme = response.programme;
                $scope.salesOrder = response.salesOrder;

                var salesOrderItemSetPromises = [];
                response.purchaseorderitemSet.forEach(function (purchaseOrderItem) {
                    salesOrderItemSetPromises.push(SalesOrderItemService.get(purchaseOrderItem.salesOrderItem, ['item', 'distributionplannode_set']).then(function (salesOrderItem) {
                        var formattedDocumentItem = {
                            description: salesOrderItem.item.description,
                            materialCode: salesOrderItem.item.materialCode,
                            quantity: purchaseOrderItem.quantity ? purchaseOrderItem.quantity : salesOrderItem.quantity,
                            unit: salesOrderItem.item.unit,
                            sales_order_item: salesOrderItem,
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
                $scope.salesOrder = response.sales_order;

                var releaseOrderItemSetPromises = [];
                response.releaseorderitem_set.forEach(function (releaseOrderItem) {
                    releaseOrderItemSetPromises.push(
                        ReleaseOrderItemService.get(releaseOrderItem).then(function (result) {
                            var formattedDocumentItem = {
                                description: result.purchase_order_item.sales_order_item.item.description,
                                materialCode: result.purchase_order_item.sales_order_item.item.material_code,
                                quantity: result.quantity ? result.quantity : result.purchase_order_item.sales_order_item.quantity,
                                unit: result.purchase_order_item.sales_order_item.item.unit.name,
                                sales_order_item: result.purchase_order_item.sales_order_item,
                                distributionplannodes: result.purchase_order_item.sales_order_item.distributionplannode_set
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
            showLoadingModal(true);
            var responses = [];
            var distributionPlanNodes = $scope.selectedDocumentItem.distributionplannodes;
            var responsePromises = [];
            distributionPlanNodes.forEach(function (node) {
                responsePromises.push(
                    DistributionPlanNodeService.getNodeResponse(node.id).then(function (response) {
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
            console.log('initializing ', responseNode);
            if (_.isEmpty($scope.distributionPlanId)) {
                $scope.distributionPlanId = responseNode.plan_id;
                console.log('initialized distributionPlanId', $scope.distributionPlanId);
            }
        }

        var setResponseNodes = function (selectedDocumentItem, responseNodes) {
            $scope.responses = [];
            responseNodes.forEach(function (responseNode) {
                setDistributionPlan(responseNode);
                var responseDetails = {
                    nodeRunId: responseNode.node_run_id,
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


        function saveNodeRun(response, nodeId) {
            var nodeRun = {
                scheduled_message_task_id: 'MANUAL',
                node: nodeId,
                status: 'completed',
                phone: 'MANUAL'
            };

            return NodeRunService.createNodeRun(nodeRun);
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
                mode_of_delivery: 'WAREHOUSE',
                parent: null,
                item: $scope.selectedDocumentItem.sales_order_item.id,
                targeted_quantity: response.quantity,
                planned_distribution_date: formatDateForSave(plannedDate),
                remark: '',
                track: false
            };

            return DistributionPlanNodeService.create(node);
        }

        function saveNewResponse(response) {
            return saveNode(response).then(function (createdNode) {
                return saveNodeRun(response, createdNode.id).then(function (createdNodeRun) {
                    response.nodeRunId = createdNodeRun.id;
                    return response;
                });
            });
        }

        function saveResponseReceived(nodeRunId, response) {
            var received = response.received;
            var receivedDetails = response.received_answer;

            if (received) {
                if (typeof(receivedDetails) === 'undefined') {
                    return QuestionService.getQuestionByLabel('productReceived').then(function (question) {
                        var answerDetails = {
                            question: question.id,
                            value: received,
                            node_run: nodeRunId
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

        function saveResponseQuantity(nodeRunId, response) {
            var quantity = response.quantity;
            var quantityDetails = response.quantity_answer;

            if (quantity) {
                if (typeof(quantityDetails) === 'undefined') {
                    return QuestionService.getQuestionByLabel('amountReceived').then(function (question) {
                        var answerDetails = {
                            question: question.id,
                            value: quantity,
                            node_run: nodeRunId
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

        function saveResponseDateReceived(nodeRunId, response) {
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
                            line_item_run: nodeRunId
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

        function saveResponseQuality(nodeRunId, response) {
            var quality = response.quality;
            var qualityDetails = response.quality_answer;

            if (quality) {
                if (typeof(qualityDetails) === 'undefined') {
                    return QuestionService.getQuestionByLabel('qualityOfProduct').then(function (question) {
                        var answerDetails = {
                            question: question.id,
                            value: quality,
                            node_run: nodeRunId
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


        function saveResponseSatisfied(nodeRunId, response) {
            var satisfied = response.satisfied;
            var satisfiedDetails = response.satisfied_answer;

            if (satisfied) {
                if (typeof(satisfiedDetails) === 'undefined') {
                    return QuestionService.getQuestionByLabel('satisfiedWithProduct').then(function (question) {
                        var answerDetails = {
                            question: question.id,
                            value: satisfied,
                            node_run: nodeRunId
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


        function saveResponseRemark(nodeRunId, response) {
            var remark = response.remark;
            var remarkDetails = response.remark_answer;

            if (remark) {
                if (typeof(remarkDetails) === 'undefined') {
                    return QuestionService.getQuestionByLabel('feedbackAboutDissatisfaction').then(function (question) {
                        var answerDetails = {
                            question: question.id,
                            value: remark,
                            node_run: nodeRunId
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
            saveResponsePartsPromise.push(saveResponseReceived(response.nodeRunId, response));
            saveResponsePartsPromise.push(saveResponseQuantity(response.nodeRunId, response));
            saveResponsePartsPromise.push(saveResponseDateReceived(response.nodeRunId, response));
            saveResponsePartsPromise.push(saveResponseQuality(response.nodeRunId, response));
            saveResponsePartsPromise.push(saveResponseSatisfied(response.nodeRunId, response));
            saveResponsePartsPromise.push(saveResponseRemark(response.nodeRunId, response));
            var squashedResponsesPartsPromises = $q.all(saveResponsePartsPromise);
            return squashedResponsesPartsPromises;
        }

        function saveResponseItems() {
            var saveResponseItemPromises = [];
            $scope.responses.forEach(function (response) {
                if (response.nodeRunId) {
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
            return DistributionPlanService.create({programme: 1})
                .then(function (createdPlan) {
                    return createdPlan;
                });
        }

        $scope.saveResponses = function () {
            if ($scope.distributionPlanId) {
                saveWithToast();
            }
            else {
                console.log('we are here 333');
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
                        ContactService.filter(query.term).then(function (foundContacts) {
                            data.results = formatResponse(foundContacts);
                            query.callback(data);
                        });
                    },
                    initSelection: function (element, callback) {
                        $timeout(function () {
                            var modelValue = ngModel.$modelValue;
                            if (modelValue) {
                                ContactService.get(modelValue).then(function (contact) {
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
