(function (module) {

    function getNumberOf(receivedCriteria, data) {
        return data.filter(function (answer) {
            return answer.productReceived && answer.productReceived.toLowerCase() === receivedCriteria.toLowerCase();
        });
    }

    function getPinColourFromResponses(data) {
        var noProductRecieved = getNumberOf("yes", data).length;
        var RED = '#DF0101', GREEN = '#088A29', YELLOW = '#FFFF00';
        if (noProductRecieved === data.length) return GREEN;
        if (noProductRecieved > 0 && noProductRecieved < data.length) return YELLOW;
        return RED;
    }

    function Marker(center, data, scope) {
        var markerIcon = function () {
            return new L.DivIcon({
                iconSize: new L.Point([10, 10]),
                className: "ips-marker-icon marker-icon ",
                html: "<div><i class='pin'><span style='background-color:" + getPinColourFromResponses(data) + "'></span></i></div>",
                popupAnchor: [5, -10]
            });
        };

        var marker = L.marker(center, {icon: markerIcon()});

        marker.nodeId = data.id;

        var assignClickedMarkerData = function () {
            scope.$apply(function () {
                scope.clickedMarker = data;
            });
        };

        marker.on('click', function () {
            var consigneeResponse = data[0];
            consigneeResponse && assignClickedMarkerData();
        });
        return marker;
    }

    function Layer(map, layer, layerOptions) {
        var selected = false;

        function init(self) {
            layer
                .on('mouseover', self.highlight)
                .on('mouseout', self.unhighlight)
                .on('click', self.click);
        }

        this.click = function () {
            map.fitBounds(layer.getBounds());
        };

        this.getLayerBounds = function () {
            return layer.getBounds();
        };

        this.getCenter = function () {
            return layer.getBounds().getCenter();
        };

        this.highlight = function () {
            layer.setStyle(layerOptions.selectedLayerStyle);
            selected = true;
        };

        this.unhighlight = function () {
            layer.setStyle(layerOptions.districtLayerStyle);
            selected = false;
        };

        this.isHighlighted = function () {
            return selected;
        };

        init(this);
    }

    module.factory('LayerMap', function () {
        var layerList = {};

        function getRandomCoordinates(bound) {
            return {
                lat: Math.random() * (bound._northEast.lat - bound._southWest.lat) + bound._southWest.lat,
                lng: Math.random() * (bound._northEast.lng - bound._southWest.lng) + bound._southWest.lng
            }
        }

        return {
            addLayer: function (layer, layerName) {
                layerList[layerName] = layer;
            },
            getLayer: function (layerName) {
                return layerList[layerName.toLowerCase()];
            },
            getRandomCoordinates: function (layerName) {
                var bound = this.getLayerBoundsBy(layerName);
                return getRandomCoordinates(bound)
            },
            getLayerBoundsBy: function (layerName) {
                return this.getLayer(layerName).getLayerBounds();
            },
            getLayerCenter: function (layerName) {
                return layerList[layerName].getCenter();
            },
            getSelectedLayer: function () {
                var highlightedLayer = {};
                angular.forEach(layerList, function (layer, layerName) {
                    if (layer.isHighlighted()) {
                        highlightedLayer[layerName] = layer;
                    }
                });
                return highlightedLayer;
            },
            selectLayer: function (layerName) {
                layerList[layerName].highlight();
            },
            clickLayer: function (layerName) {
                layerList[layerName].click();
            }
        }
    });

    module.factory('GeoJsonService', function ($http, EumsConfig) {
        return {
            districts: function () {
                return $http.get(EumsConfig.DISTRICTGEOJSONURL, {cache: true});
            }
        }
    });

    module.factory('MapService', function (GeoJsonService, EumsConfig, LayerMap, IPService, $q) {
        var map;

        function initMap(elementId) {
            var map = L.map(elementId, {
                zoomControl: true
            }).setView([1.436, 32.884], 7);

            L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a>',
                maxZoom: 13,
                minZoom: 7
            }).addTo(map);

            return map;
        }

        function addIPMarker(marker) {
            return marker.addTo(map);
        }

        function addDistrictsLayer(map) {
            return GeoJsonService.districts().then(function (response) {
                L.geoJson(response.data, {
                    style: EumsConfig.districtLayerStyle,
                    onEachFeature: function (feature, layer) {
                        var districtLayer = new Layer(map, layer, EumsConfig);
                        var districtName = feature.properties.DNAME_2010 || 'unknown';
                        LayerMap.addLayer(districtLayer, districtName.toLowerCase())
                    }
                }).addTo(map);
            });
        }

        return {
            render: function (elementId, layerName) {
                map = initMap(elementId);

                return addDistrictsLayer(map).then(function () {
                    layerName && this.clickLayer(layerName);
                    return this;
                }.bind(this));
            },
            getZoom: function () {
                return map.getZoom();
            },
            getCenter: function () {
                return map.getCenter();
            },
            addMarker: function (marker) {
                return addIPMarker(marker);
            },
            removeMarker: function (marker) {
                map.removeLayer(marker);
            },
            highlightLayer: function (layerName) {
                LayerMap.selectLayer(layerName.toLowerCase());
            },
            getHighlightedLayer: function () {
                return LayerMap.getSelectedLayer();
            },
            mapIPsToRandomLayerCoordinates: function (layerName) {
                var self = this;
                return IPService.groupIPsByDistrict(layerName).then(function (ips) {
                    return ips.map(function (ip) {
                        return {
                            ip: ip,
                            coordinates: self.getRandomCoordinates(layerName)
                        }
                    });
                });
            },
            mapAllIPsToRandomLayerCoordinates: function () {
                var self = this;
                return IPService.loadAllDistricts().then(function (districtNames) {
                    var ipWithCoordinatesPromises = districtNames.data.map(function (districtName) {
                        return self.mapIPsToRandomLayerCoordinates(districtName);
                    });
                    return $q.all(ipWithCoordinatesPromises);
                });
            },
            getLayerCenter: function (layerName) {
                return LayerMap.getLayerCenter(layerName.toLowerCase());
            },
            getLayerBounds: function (layerName) {
                return LayerMap.getLayerBoundsBy(layerName);
            },
            clickLayer: function (layerName) {
                if (layerName) {
                    LayerMap.clickLayer(layerName.toLowerCase());
                    this.highlightLayer(layerName);
                }
            },
            getRandomCoordinates: function (layerName) {
                return LayerMap.getRandomCoordinates(layerName)
            }
        };
    });

    module.directive('map', function (MapService, $window, IPService, DistributionPlanService) {
        return {
            scope: false,
            link: function (scope, element, attrs) {
                MapService.render(attrs.id, null).then(function (map) {
                    $window.map = map;
                    scope.clickedMarker = "";
                    scope.allmarkers = [];
                    scope.programme = '';
                    DistributionPlanService.mapUnicefIpsWithConsignees().then(function (ips) {
                        ips.map(function (ip) {
                            ip.consignees().then(function (consigneesResponses) {
                                consigneesResponses.map(function (consigneesResponse) {
                                    var consigneeCoordinates = map.getRandomCoordinates(consigneesResponse.data.location.toLowerCase());
                                    DistributionPlanService.getConsigneeDetails(consigneesResponse.data.id).then(function (response) {
                                        var markerData = JSON.parse(JSON.parse(response.data));
                                        var marker = new Marker([consigneeCoordinates.lat, consigneeCoordinates.lng], markerData, scope);
                                        var consigneeResponse = markerData[0];
                                        consigneeResponse && map.addMarker(marker) && scope.allmarkers.push({marker: marker, node: consigneeResponse.node});
                                    });

                                });
                            });
                        });
                    });
                    scope.$watch('params.location', function (newLocation) {
                        newLocation && MapService.clickLayer(newLocation.district);
                    }, true);
                });
            }
        }
    }).directive('panel', function () {
        return {
            scope: true,
            link: function (scope, element, attrs) {
                scope.expanded = true;

                var expandAnimation = JSON.parse(attrs.panelExpand);
                var collapseAnimation = JSON.parse(attrs.panelCollapse);
                var panel = $(element);

                var togglePanel = function () {
                    var $closePanel = $('.close-panel span'),
                        zoomControl = $('.leaflet-control-zoom');
                    if (scope.expanded) {
                        panel.animate(collapseAnimation);
                        scope.expanded = false;
                        $closePanel.removeClass("glyphicon-chevron-down");
                        $closePanel.addClass("glyphicon-chevron-up");
                        zoomControl.addClass('leaflet-control-zoom-left');
                        zoomControl.removeClass('leaflet-control-zoom');

                    } else {
                        panel.animate(expandAnimation);
                        scope.expanded = true;
                        $('.leaflet-control-zoom-left').addClass('leaflet-control-zoom');
                        $closePanel.removeClass("glyphicon-chevron-up");
                        $closePanel.addClass("glyphicon-chevron-down");
                    }
                    return false;
                };
                $(".close-panel").click(function () {
                    togglePanel();
                });
            }
        }
    }).directive('mapFilter', function () {
        return{
            restrict: 'A',
            templateUrl: '/static/app/views/partials/filters.html',
            link: function (scope, elem, attrs) {

            }
        }
    }).directive('mapSummary', function () {
        return{
            restrict: 'A',
            templateUrl: '/static/app/views/partials/marker-summary.html'
        }
    }).directive('selectProgram', function (ProgrammeService, FilterService, DistributionPlanService, $q, MapService) {
            return {
                restrict: 'A',
                link: function (scope, elem) {
                    ProgrammeService.fetchProgrammes().then(function (response) {
                        return response.data.map(function (programe) {
                            return {id: programe.id, text: programe.name}
                        });

                    }).then(function (data) {
                        $(elem).select2({
                            data: data
                        });
                    });

                    var nodeIdsEqual = function (nodes, nodeId) {
                        return nodes.filter(function (node) {
                            return node.data.id == nodeId
                        })
                    };

                    var markerNotInFilteredNodes = function (nodeId, filteredNodes) {
                        var nonEmptyNodes = filteredNodes.filter(function (node) {
                            return node.length > 0
                        });
                        var nodes = nonEmptyNodes[0];
                        return (((typeof nodes == 'undefined') || nodeIdsEqual(nodes, nodeId).length <= 0));
                    };

                    scope.$watch('programme', function (newProgramme) {
                        FilterService.getDistributionPlansBy(newProgramme).then(function (selectedProgramsPlans) {
                                var selectedPlanNodes = selectedProgramsPlans.map(function (plan) {
                                    return DistributionPlanService.getNodes(plan)
                                });
                                $q.all(selectedPlanNodes).then(function (filteredNodes) {
                                    scope.allmarkers.forEach(function (markerNodeMap) {
                                        if (markerNotInFilteredNodes(markerNodeMap.node, filteredNodes)) {
                                            MapService.removeMarker(markerNodeMap.marker);
                                        }
                                    });
                                });

                                if (selectedProgramsPlans.length <= 0) {
                                    scope.allmarkers.forEach(function (markerNodeMap) {
                                       MapService.addMarker(markerNodeMap.marker);
                                    })
                                }
                            }
                        )
                        ;
                    });
                }
            }
        }
    ).
        factory('FilterService', function (DistributionPlanService) {

            var filterPlanById = function (distributionPlans, programmeId) {
                return distributionPlans.data.filter(function (plan) {
                    return plan.programme == programmeId;
                });
            };

            return {
                getDistributionPlansBy: function (programmeId) {
                    return DistributionPlanService.fetchPlans().then(function (allDistributionPlans) {
                        return filterPlanById(allDistributionPlans, programmeId);
                    });
                }
            }
        });

})
(angular.module('eums.map', ['eums.config', 'eums.ip', 'Programme', 'DistributionPlan']));