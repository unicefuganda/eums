'use strict';

angular.module('DistributionPlanNode', ['eums.config', 'Contact', 'Consignee', 'eums.service-factory'])
    .factory('DistributionPlanNodeService', function ($http, $q, EumsConfig, ContactService, ConsigneeService, ServiceFactory) {

        return ServiceFactory.create({
            uri: EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN_NODE,
            propertyServiceMap: {consignee: ConsigneeService, contact_person_id: ContactService, children: 'self'},
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
                        return planNode;
                    });
                }
            }
        });
    });
