'use strict';


angular.module('Delivery', ['eums.config', 'DeliveryNode', 'ngTable', 'siTable', 'Programme', 'PurchaseOrder', 'User', 'Directives'])
    .factory('DeliveryService', function ($http, $q, $timeout, EumsConfig, DeliveryNodeService, ServiceFactory, ContactService) {
        return ServiceFactory.create({
            uri: EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN,
            propertyServiceMap: {
                contact_person_id: ContactService,
                distributionplannode_set: DeliveryNodeService
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
                        return DeliveryNodeService.get(nodeId);
                    });
                    return $q.all(distributionPlanNodesPromises);
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
                getLatestItemDeliveries: function (responsesLocationMap, location, number) {
                    var allResponses = this.orderResponsesByDate(responsesLocationMap, location);
                    var responses = [];
                    var items = [];
                    allResponses.forEach(function (response) {
                        if (items.length < number && !_.contains(items, response.item)) {
                            items.push(response.item);
                            responses.push(response);
                        }
                    });
                    return responses;
                }
            }
        })
            ;

        function getUniqueLocations(consigneesResponsesWithNodeLocation) {
            return _.uniq(consigneesResponsesWithNodeLocation, function (responseWithNodeLocation) {
                return responseWithNodeLocation.location.toLowerCase();
            });
        }

        function aggregateAllResponses(data, location) {
            var totalSent = data.length;
            if(totalSent > 0) {
                var totalYes = data.reduce(function (total, current) {
                    return current.productReceived && current.productReceived.toLowerCase() === 'yes' ? total + 1 : total;
                }, 0);


                var totalValueSent = data.reduce(function (total, current) {
                    return (current.amountSent * current.value) + total;
                }, 0);

                var totalValueReceived = data.reduce(function (total, current) {
                    var amountReceived = isNaN(current.amountReceived) ? 0 : current.amountReceived;
                    return (Number(amountReceived) * current.value) + total;
                }, 0);


                var percentageReceived = 0;
                if (totalValueSent > 0) {
                    percentageReceived = Math.round((totalValueReceived / totalValueSent) * 100);
                }
                return {
                    location: location,
                    totalSent: totalSent,
                    totalReceived: totalYes,
                    totalNotReceived: totalSent - totalYes,
                    totalValueSent: totalValueSent,
                    totalValueReceived: totalValueReceived,
                    percentageReceived: percentageReceived,
                    percentageNotReceived: 100 - percentageReceived
                };
            } else {
                var emptyState = '--';
                return {
                    location: location,
                    totalSent: emptyState,
                    totalReceived: emptyState,
                    totalNotReceived: emptyState,
                    totalValueSent: emptyState,
                    totalValueReceived: emptyState,
                    percentageReceived: emptyState,
                    percentageNotReceived: emptyState
                };
            }


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
            return moment(secondResponse.dateOfReceipt, 'DD/MM/YYY') - moment(firstResponse.dateOfReceipt, 'DD/MM/YYY');
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
    })
;


