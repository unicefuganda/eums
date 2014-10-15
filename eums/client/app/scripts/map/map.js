(function (module) {

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

        return {
            addLayer: function (layer, layerName) {
                layerList[layerName] = layer;
            },
            getLayer: function (layerName) {
                return layerList[layerName];
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

    module.factory('MapService', function (GeoJsonService, EumsConfig, LayerMap) {
        var map;

        function initMap(elementId) {
            var map = L.map(elementId).setView([1.436, 32.884], 7);

            L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a>',
                maxZoom: 13,
                minZoom: 7
            }).addTo(map);

            return map;
        }

        function addIPMarker(center, ip) {
            var popup = L.popup({ closeButton: false, offset: new L.Point(0, 44), className: "marker-popup", autoPan: false});
            var popupContent = '<p> name: ' + ip.Name + '<br />location: ' + ip.City + '</p>';


            var marker = L.marker(center);

            marker.on('click', function () {
                popup.setLatLng(center)
                    .setContent(popupContent)
                    .openOn(map);
            });

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
            addMarker: function (center, ip) {
                return addIPMarker(center, ip);
            },
            highlightLayer: function (layerName) {
                LayerMap.selectLayer(layerName.toLowerCase());
            },
            getHighlightedLayer: function () {
                return LayerMap.getSelectedLayer();
            },
            getLayerCenter: function (layerName) {
                return LayerMap.getLayerCenter(layerName.toLowerCase());
            },
            clickLayer: function (layerName) {
                if (layerName) {
                    LayerMap.clickLayer(layerName.toLowerCase());
                    this.highlightLayer(layerName);
                }
            }
        };
    });

    module.directive('map', function (MapService, $window, IPService) {
        return {
            scope: false,
            link: function (scope, element, attrs) {
                MapService.render(attrs.id, null).then(function (map) {
                    $window.map = map;

                    IPService.getAllIps().then(function (response) {
                        response.data.forEach(function (ip) {
                            if (ip.City) {
                                var center = map.getLayerCenter(ip.City.toLowerCase());
                                map.addMarker(center, ip);
                            }
                        });
                    });

                    scope.$watch('params.location', function (newLocation) {
                        newLocation && MapService.clickLayer(newLocation.district);
                    }, true);
                });
            }
        }
    });

})(angular.module('eums.map', ['eums.config']));