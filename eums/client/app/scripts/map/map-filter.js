angular.module('eums.mapFilter', ['eums.map', 'DistributionPlan'])
    .factory('MapFilterService', function (FilterService, DistributionPlanService, DistributionPlanNodeService, $q) {
        var allMarkers = [];
        var noneEmptyNodes = function (filteredNodes) {
            return filteredNodes.filter(function (nodes) {
                return nodes.length > 0;
            });
        };

        function filterMarker(node, allMarkers) {
            var filteredMarkers = [];
            allMarkers.forEach(function (markerNodeMap) {
                if (markerNodeMap.consigneeResponse[0].node === node.data.id) {
                    filteredMarkers.push(markerNodeMap);
                }
            });
            return filteredMarkers;
        }

        return {
            filterMarkersByProgramme: function (programmeId, markerMaps) {
                return FilterService.getDistributionPlansBy(programmeId).then(function (plans) {
                    var nodesSelected = plans.map(function (plan) {
                        return DistributionPlanService.getNodes(plan);
                    });

                    var filteredMarkers = $q.all(nodesSelected).then(function (nodes) {
                        return noneEmptyNodes(nodes).map(function (node) {
                            return filterMarker(node[0], markerMaps);
                        });
                    });

                    return filteredMarkers.then(function (markers) {
                        return _.flatten(markers);
                    });
                });
            },
            filterMarkersByIp: function (ip, markerMaps) {
                return DistributionPlanNodeService.filter({consignee: ip.id}).then(function(nodes) {
                    var markers = nodes.map(function (node) {
                        return markerMaps.map(function (markerMap) {
                            if (markerMap.consigneeResponse[0].node === node.id) {
                                return markerMap;
                            }
                        });
                    });

                    return _.remove(_.flatten(markers), function (marker) {
                        return marker;
                    });
                });
            },
            setMapMarker: function (marker) {
                allMarkers.push(marker);
            },
            getAllMarkerMaps: function () {
                return allMarkers;
            }
        };
    });