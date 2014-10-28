angular.module('eums.mapFilter', ['eums.map', 'DistributionPlan'])
    .factory('MapFilterService', function (FilterService, DistributionPlanService, $q) {
        var allMarkers = [];
        var noneEmptyNodes = function (filteredNodes) {
            return filteredNodes.filter(function (nodes) {
                return nodes.length > 0;
            });
        };

        function filterMarker(node, allMarkers) {
            var filteredMarkers = [];
            allMarkers.forEach(function (markerNodeMap) {
                if (markerNodeMap.consigneeResponse[0].node == node.data.id) {
                    filteredMarkers.push(markerNodeMap);
                }
            });
            return filteredMarkers;
        }

        return {
            filterMarkersByProgramme: function (programmeId) {
                var self = this;
                return FilterService.getDistributionPlansBy(programmeId).then(function (plans) {
                    var nodesSelected = plans.map(function (plan) {
                        return DistributionPlanService.getNodes(plan);
                    });

                    var filteredMarkers = $q.all(nodesSelected).then(function (nodes) {
                        return noneEmptyNodes(nodes).map(function (node) {
                            return filterMarker(node[0], self.getAllMarkerMaps())
                        });
                    });

                    return filteredMarkers.then(function (markers) {
                        return _.flatten(markers);
                    });
                });
            },
            filterMarkersByIp: function (ip) {
                var self = this;
                return DistributionPlanService.getNodesBy(ip).then(function (data) {
                    return data.map(function (node) {
                        return self.getAllMarkerMaps().map(function (markerMap) {
                            return markerMap.consigneeResponse[0].node == node.data.id
                        });
                    });
                });
            },
            setMapMarker: function (marker) {
                allMarkers.push(marker)
            },
            getAllMarkerMaps: function () {
                return allMarkers;
            }
        };
    });