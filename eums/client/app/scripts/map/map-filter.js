angular.module('eums.mapFilter', ['eums.map', 'Delivery'])
    .factory('MapFilterService', function (DeliveryService, DistributionPlanNodeService, $q) {
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
                return DeliveryService.filter({programme: programmeId}).then(function (deliveries) {
                    var nodesSelected = deliveries.map(function (delivery) {
                        return DeliveryService.getNodes(delivery);
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