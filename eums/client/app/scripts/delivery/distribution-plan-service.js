'use strict';


angular.module('DistributionPlan', ['eums.config', 'DistributionPlanNode', 'ngTable', 'siTable', 'Programme', 'PurchaseOrder', 'User', 'Directives'])
    .factory('DistributionPlanService', function ($http, $q, $timeout, EumsConfig, DistributionPlanNodeService, ServiceFactory, ContactService) {
        return ServiceFactory.create({
            uri: EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN,
            propertyServiceMap: {
                contact_person_id: ContactService,
                distributionplannode_set: DistributionPlanNodeService
            },
            methods: {
                aggregateStats: function (data, location) {
                    //TODO Remove. This should happen at the backend
                    return aggregateAllResponses(getResponseFor(data, location), location);
                },
                //TODO This should be all:
                fetchPlans: function () {
                    return $http.get(EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN, {cache: true});
                },
                //TODO Remove. Clients should get nodes when they get the plan
                getNodes: function (plan) {
                    var distributionPlanNodesPromises = plan.distributionplannode_set.map(function (nodeId) {
                        return DistributionPlanNodeService.get(nodeId);
                    });
                    return $q.all(distributionPlanNodesPromises);
                },
                getAllPlansNodes: function () {
                    var mergedPromises = [];
                    return this.fetchPlans().then(function (response) {
                        var nodePlanPromises = response.data.map(function (plan) {
                            return this.getNodes(plan);
                        }.bind(this));

                        return $q.all(nodePlanPromises).then(function (nodePlans) {
                            return mergedPromises.concat.apply(mergedPromises, nodePlans);
                        });
                    }.bind(this));
                },

                getConsigneeDetails: function (consigneeId) {
                    return $http.get(EumsConfig.BACKEND_URLS.RESPONSES + consigneeId + '/', {cache: true});
                },
                aggregateResponses: function () {
                    return this.getAllEndUserResponses().then(function (responseFromServer) {
                        return aggregateAllResponses(responseFromServer.data);
                    });
                },
                aggregateResponsesForDistrict: function (district) {
                    return this.groupAllResponsesByLocation().then(function (responsesWithLocation) {
                        return aggregateAllResponseFor(responsesWithLocation, district);
                    });
                },
                // TODO: Replace all calls to getAllEndUserResponses to getAllConsigneeResponses
                getAllConsigneeResponses: function () {
                    return $http.get(EumsConfig.BACKEND_URLS.RESPONSES, {cache: true});
                },
                getAllEndUserResponses: function () {
                    return $http.get(EumsConfig.BACKEND_URLS.END_USER_RESPONSES, {cache: true});
                },
                getResponsesByLocation: function (district) {
                    return this.groupAllResponsesByLocation().then(function (responsesWithLocation) {
                        return getResponseFor(responsesWithLocation, district);
                    });
                },
                orderAllResponsesByDate: function (district) {
                    return this.getResponsesByLocation(district).then(function (responses) {
                        return orderResponsesByDateReceived(responses);
                    });
                },
                orderResponsesByDate: function (responsesLocationMap, location) {
                    return orderResponsesByDateReceived(getResponseFor(responsesLocationMap, location));
                },
                mapConsigneesResponsesToNodeLocation: function () {
                    return this.getAllEndUserResponses().then(function (responses) {
                        return $q.all(responses.data);
                    });
                },
                groupResponsesByLocation: function (responses) {
                    return getUniqueLocations(responses).map(function (response) {
                        return {
                            location: response.location.toLowerCase(),
                            consigneeResponses: (function () {
                                return responses.filter(function (responseWithLocation) {
                                    return responseWithLocation.location.toLowerCase() === response.location.toLowerCase();
                                });
                            })()
                        };
                    });
                },
                groupAllResponsesByLocation: function () {
                    return this.mapConsigneesResponsesToNodeLocation().then(function (allResponses) {
                        return getUniqueLocations(allResponses).map(function (response) {
                            return {
                                location: response.location.toLowerCase(),
                                consigneeResponses: (function () {
                                    return allResponses.filter(function (responseWithLocation) {
                                        return responseWithLocation.location.toLowerCase() === response.location.toLowerCase();
                                    });
                                })()
                            };
                        });
                    });
                },
                getMiddleMen: function () {
                    return $http.get(EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN_NODE + '?search=MIDDLE_MAN', {cache: true}).then(function (response) {
                        return response.data;
                    });
                },
                //TODO Remove
                createPlan: function (planDetails) {
                    return $http.post(EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN, planDetails).then(function (response) {
                        if (response.status === 201) {
                            return response.data;
                        }
                        else {
                            return {error: response};
                        }
                    });
                }
            }
        });

        function addChildrenDetail(node, plan) {
            if (node) {
                node.temporaryChildrenList = [];
                node.children.forEach(function (childNodeId) {
                    var descendant = findDetailedNode(childNodeId, plan);
                    node.temporaryChildrenList.push(descendant);
                    addChildrenDetail(descendant, plan);
                });
                node.children = node.temporaryChildrenList;
                delete node.temporaryChildrenList;
                return node;
            }
        }

        function findDetailedNode(nodeId, plan) {
            return plan.nodeList.filter(function (node) {
                return node.id === nodeId;
            })[0];
        }

        function getUniqueLocations(consigneesResponsesWithNodeLocation) {
            return _.uniq(consigneesResponsesWithNodeLocation, function (responseWithNodeLocation) {
                return responseWithNodeLocation.location.toLowerCase();
            });
        }

        function aggregateAllResponses(data, location) {
            var totalSent = data.length;
            var totalYes = data.reduce(function (total, current) {
                return current.productReceived && current.productReceived.toLowerCase() === 'yes' ? total + 1 : total;
            }, 0);

            return {
                location: location,
                totalSent: totalSent,
                totalReceived: totalYes,
                totalNotReceived: totalSent - totalYes
            };
        }

        function aggregateAllResponseFor(responsesWithLocation, district) {
            var aggregates = {};
            responsesWithLocation.forEach(function (responseWithLocation) {
                if (district.toLowerCase() === responseWithLocation.location.toLowerCase()) {
                    aggregates = aggregateAllResponses(responseWithLocation.consigneeResponses, district);
                }
            });
            return aggregates;
        }

        function compareReceiptDate(firstResponse, secondResponse) {
            return moment(firstResponse.dateOfReceipt, 'DD/MM/YYY') - moment(secondResponse.dateOfReceipt, 'DD/MM/YYY');
        }

        function orderResponsesByDateReceived(consigneeResponses) {
            return consigneeResponses.sort(compareReceiptDate);
        }

        function getResponseFor(responsesWithLocation, district) {
            var responses = [];
            if (district) {
                responsesWithLocation.forEach(function (responseWithLocation) {
                    if (district.toLowerCase() === responseWithLocation.location.toLowerCase()) {
                        responses = responseWithLocation.consigneeResponses;
                    }
                });
            } else {
                responsesWithLocation.forEach(function (responseWithLocation) {
                    responses.push(responseWithLocation.consigneeResponses);
                });
            }
            return _.flatten(responses);
        }

    });


