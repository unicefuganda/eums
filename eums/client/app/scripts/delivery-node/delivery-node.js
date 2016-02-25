'use strict';

angular.module('DeliveryNode', ['eums.config', 'Contact', 'Consignee', 'eums.service-factory', 'ReleaseOrderItem'])
    .factory('DeliveryNode', function () {
        return function (json) {
            !json && (json = {});

            Object.defineProperty(this, 'contactPerson', {
                set: function (person) {
                    this.contactPersonId = person;
                }.bind(this),
                get: function () {
                    return this.contactPersonId;
                }.bind(this)
            });

            Object.defineProperty(this, 'isEndUser', {
                set: function (newValue) {
                    if (newValue) {
                        this.treePosition = 'END_USER';
                    }
                    else {
                        this.treePosition = 'MIDDLE_MAN';
                    }
                }.bind(this),
                get: function () {
                    return this.treePosition === 'END_USER';
                }.bind(this)
            });

            this.id = json.id;
            this.item = json.item;
            this.deliveryDate = json.deliveryDate || '';
            this.quantityIn = json.quantityIn || 0;
            this.quantity = json.quantity;
            this.contactPerson = json.contactPersonId || json.contactPerson;
            this.contactPersonId = json.contactPersonId || json.contactPerson;
            this.remark = json.remark || '';
            this.track = json.track || false;
            this.trackSubmitted = json.track || false;
            this.isEndUser = json.isEndUser || false;
            this.treePosition = json.treePosition || 'MIDDLE_MAN';
            this.consignee = json.consignee;
            this.location = json.location;
            this.parent = json.parent;
            this.distributionPlan = json.distributionPlan;
            this.consigneeName = json.consigneeName;
            this.itemDescription = json.itemDescription;
            this.orderNumber = json.orderNumber;
            this.orderType = json.orderType;
            this.hasChildren = json.hasChildren;
            this.balance = json.balance;
            this.timeLimitationOnDistribution = json.timeLimitationOnDistribution;
            this.trackedDate = json.trackedDate;
            this.additionalRemarks = json.additionalRemarks;
            this.isAssignToSelf = json.isAssignToSelf || false;

            this.canReceiveSubConsignees = function () {
                return this.id && !this.isEndUser;
            }.bind(this);

            this.isInvalid = function () {
                return this.quantityIn <= 0 || isNaN(this.quantityIn) || !this.consignee || !this.location
                    || !this.contactPerson || !this.deliveryDate;
            };
        };
    })
    .factory('DeliveryNodeService', function ($http, $q, EumsConfig, ContactService, ConsigneeService, ServiceFactory, DeliveryNode, PurchaseOrderItemService) {
        return ServiceFactory.create({
            uri: EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN_NODE,
            propertyServiceMap: {
                consignee: ConsigneeService,
                contact_person_id: ContactService,
                children: 'self',
                item: PurchaseOrderItemService
            },
            model: DeliveryNode,
            methods: {
                getNodeResponse: function (nodeId) {
                    return $http.get(EumsConfig.BACKEND_URLS.NODE_RESPONSES + nodeId + '/').then(function (response) {
                        return response.data;
                    });
                },
                getLineage: function (node) {
                    return this.getDetail(node, 'lineage/');
                },
                reportLoss: function (nodeLosses) {
                    var lossPromises = [];
                    nodeLosses.each(function (loss) {
                        lossPromises.push($http.patch(
                            EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN_NODE + loss.id + '/report_loss/',
                            {quantity: loss.quantity, justification: loss.justification}));
                    });
                    return $q.all(lossPromises);
                }
            }
        });
    });
