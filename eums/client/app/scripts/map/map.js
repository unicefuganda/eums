(function (module) {

    function getNumberof(receivedCriteria, data) {
        return data.filter(function (answer) {
            return answer.productReceived && answer.productReceived.toLowerCase() === receivedCriteria.toLowerCase();
        });
    }

    function getPinColourFromResponses(data) {
        var noProductRecieved = getNumberof("yes", data).length;
        var RED = '#DF0101', GREEN = '#088A29', YELLOW = '#F3F781';
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
                zoomControl: false
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
            selectIcon: function (icon) {
                displayIconSummary(icon);
            },
            addMarker: function (marker) {
                return addIPMarker(marker);
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

                    DistributionPlanService.mapUnicefIpsWithConsignees().then(function (ips) {
                        ips.map(function (ip) {
                            ip.consignees().then(function (consigneesResponses) {
                                consigneesResponses.map(function (consigneesResponse) {
                                    var consigneeCoordinates = map.getRandomCoordinates(consigneesResponse.data.location.toLowerCase());
                                    DistributionPlanService.getConsigneeDetails(consigneesResponse.data.id).then(function (response) {
                                        var markerData = JSON.parse(JSON.parse(response.data));
                                        var marker = new Marker([consigneeCoordinates.lat, consigneeCoordinates.lng], markerData, scope);
                                        var consigneeResponse = markerData[0];
                                        consigneeResponse && map.addMarker(marker);
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
                    var $closePannel = $('.close-panel span');
                    if (scope.expanded) {
                        panel.animate(collapseAnimation);
                        scope.expanded = false;
                        $closePannel.removeClass("glyphicon-chevron-down");
                        $closePannel.addClass("glyphicon-chevron-up");

                    } else {
                        panel.animate(expandAnimation);
                        scope.expanded = true;
                        $closePannel.removeClass("glyphicon-chevron-up");
                        $closePannel.addClass("glyphicon-chevron-down");
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
            link: function (scope) {
            }
        }
    }).directive('mapSummary', function () {
        return{
            restrict: 'A',
            templateUrl: '/static/app/views/partials/marker-summary.html',
        }
    });

})
(angular.module('eums.map', ['eums.config', 'eums.ip']));