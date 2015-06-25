'use strict';

angular.module('DistributionPlanNode', ['eums.config', 'Contact', 'Consignee', 'eums.service-factory'])
    .factory('DeliveryNode', function () {
        return function (json) {
            !json && (json = {});
            this.id = json.id;
            this.item = json.item;
            this.plannedDistributionDate = json.plannedDistributionDate || '';
            this.targetedQuantity = json.targetedQuantity || 0;
            this.contactPerson = json.contactPersonId || json.contactPerson;
            this.remark = json.remark || '';
            this.track = json.track || false;
            this.forEndUser = json.forEndUser || false;
            this.flowTriggered = json.flowTriggered || false;
            this.consignee = json.consignee;
            this.location = json.location;
            this.parent = json.parent;
            this.children = json.children;
            this.distributionPlan = json.distributionPlan;

            this.canReceiveSubConsignees = function() {
                return this.id && !this.forEndUser;
            }.bind(this);
        };
    })
    .factory('DistributionPlanNodeService', function ($http, $q, EumsConfig, ContactService, ConsigneeService,
                                                      ServiceFactory, DeliveryNode) {
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
                    return this.get(planNodeId, fieldsToBuild);
                }
            }
        });
    });
