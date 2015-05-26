'use strict';

angular.module('DistributionPlanNode', ['eums.config', 'Contact', 'Consignee', 'eums.service-factory'])
    .factory('DistributionPlanNodeService', function ($http, $q, EumsConfig, ContactService, ConsigneeService, ServiceFactory) {

        return ServiceFactory.create({
            uri: EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN_NODE,
            propertyServiceMap: {consignee: ConsigneeService, contact_person_id: ContactService},
            methods: {
                getNodeResponse: function (nodeId) {
                    return $http.get(EumsConfig.BACKEND_URLS.NODE_RESPONSES + nodeId + '/').then(function (response) {
                        return response.data;
                    });
                },
                getPlanNodeDetails: function (planNodeId) {
                    var getPlanNodePromise = this.get(planNodeId, ['consignee', 'contact_person_id']);
                    return getPlanNodePromise.then(function (planNode) {
                        planNode.contactPerson = planNode.contactPersonId;
                        return planNode;
                    });
                }
            }
        });
    });
