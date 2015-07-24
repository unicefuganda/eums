'use strict';

angular.module('DistributionPlanNode', ['eums.config', 'Contact', 'Consignee', 'eums.service-factory'])
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
                set: function (isEndUser) {
                    if (isEndUser) {
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
            this.plannedDistributionDate = json.plannedDistributionDate || '';
            this.targetedQuantity = json.targetedQuantity || 0;
            this.contactPerson = json.contactPersonId || json.contactPerson;
            this.contactPersonId = json.contactPersonId || json.contactPerson;
            this.remark = json.remark || '';
            this.track = json.track || false;
            this.isEndUser = json.isEndUser || false;
            this.treePosition = json.treePosition || 'MIDDLE_MAN';
            this.flowTriggered = json.flowTriggered || false;
            this.consignee = json.consignee;
            this.location = json.location;
            this.parent = json.parent;
            this.children = json.children;
            this.distributionPlan = json.distributionPlan;

            this.canReceiveSubConsignees = function () {
                return this.id && !this.isEndUser;
            }.bind(this);

            this.hasSubConsignees = function () {
                return this.children && this.children.length > 0;
            };

            this.isInvalid = function () {
                return this.targetedQuantity <= 0 || isNaN(this.targetedQuantity) || !this.consignee || !this.location
                    || !this.contactPerson || !this.plannedDistributionDate;
            };



            this.quantityLeft = function (children) {
                !children && (children = this.children);
                return this.targetedQuantity - children.sum(function (node) {
                        return !isNaN(node.targetedQuantity) ? node.targetedQuantity : 0;
                    });
            }.bind(this);
        };
    })
    .factory('DistributionPlanNodeService', function ($http, $q, EumsConfig, ContactService, ConsigneeService, ServiceFactory, DeliveryNode) {
        return ServiceFactory.create({
            uri: EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN_NODE,
            propertyServiceMap: {consignee: ConsigneeService, contact_person_id: ContactService, children: 'self'},
            model: DeliveryNode,
            methods: {
                getNodeResponse: function (nodeId) {
                    return $http.get(EumsConfig.BACKEND_URLS.NODE_RESPONSES + nodeId + '/').then(function (response) {
                        return response.data;
                    });
                },
                getPlanNodeDetails: function (planNodeId) {
                    var fieldsToBuild = ['consignee', 'contact_person_id', 'children'];
                    return this.get(planNodeId, fieldsToBuild).then(function (planNode) {
                        planNode.contactPerson = planNode.contactPersonId;
                        var buildChildren = [];
                        if (planNode.children) {
                            planNode.children.forEach(function (child) {
                                buildChildren.push(this.get(child.id, ['consignee', 'contact_person_id']));
                            }.bind(this));
                            return $q.all(buildChildren).then(function (builtChildren) {
                                planNode.children = builtChildren;
                                return planNode;
                            });
                        } else {
                            return planNode;
                        }
                    }.bind(this));
                },
                getNodesByDelivery: function (deliveryId) {
                    return $http.get(EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN_NODE + '?distribution_plan=' + deliveryId)
                        .then(function (deliveryNodes) {
                            return deliveryNodes;
                        });
                }
            }
        });
    });
