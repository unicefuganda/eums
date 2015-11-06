(function (module) {

    function getHeatMapStyle(data, layerName) {
        var style = {
            fillColor: 'white',
            fillOpacity: 1,
            weight: 1.5
        };
        data.forEach(function (locationData) {
            if (locationData.location.toUpperCase() === layerName.toUpperCase()) {
                style.fillColor = locationData.state;
            }
        });
        return style;
    }

    module.factory('GeoJsonService', function ($http, EumsConfig) {
        return {
            districts: function () {
                return $http.get(EumsConfig.DISTRICTGEOJSONURL, {cache: true});
            }
        }
    });

    module.factory('MapService', function (GeoJsonService, EumsConfig, LayerMap, Layer, IPService,
                                           $q, DeliveryService, UserService, DeliveryStatsService, LoaderService) {
        var map, mapScope;

        var zoomControl = L.control.zoom({
            position: 'topleft',
            zoomOutText: '-'
        });

        function initMap(elementId) {
            var map = L.map(elementId, {
                zoomControl: false,
                scrollWheelZoom: false,
                touchZoom: false,
                doubleClickZoom: false,
                attributionControl: false
            }).setView(EumsConfig.MAP_OPTIONS.CENTER, EumsConfig.MAP_OPTIONS.ZOOM_LEVEL);

            map.on('zoomend', function () {
                if (window.map.getZoom() < 8) {
                    mapScope.data.district = '';
                    mapScope.filter = {
                        programme: '',
                        ip: '',
                        from: '',
                        to: ''
                    };
                    window.map.setView(EumsConfig.MAP_OPTIONS.CENTER);
                }
            });

            return map;
        }

        function filterByColor(data, deliveryStatus){
            var filteredStatuses = filterDeliveryStatus(deliveryStatus);
            var result = [];
            filteredStatuses.forEach(function(status){
                result.push(data.filter(function(deliveries){
                    return deliveries.state.camelize(false) === status;
                }));
            });
            return _.flatten(result);
        }

        function filterDeliveryStatus(deliveryStatus){
            return Object.keys(deliveryStatus).filter(function (key) {
                return deliveryStatus[key]
            });
        }

        function addHeatMapLayer(scope) {
            var treePosition = scope.data.ipView?'IMPLEMENTING_PARTNER':'END_USER';
            var allFilter = angular.extend({treePosition: treePosition}, scope.filter);
            DeliveryStatsService.getMapStats(allFilter).then(function (response) {
                var filteredByColorStatsData = filterByColor(response.data, scope.deliveryStatus);
                angular.forEach(LayerMap.getLayers(), function (layer, layerName) {
                    layer.setStyle(getHeatMapStyle(filteredByColorStatsData, layerName));
                });
                DeliveryStatsService.getStatsDetails(allFilter).then(function (responses) {
                    scope.data.totalStats = responses.data;
                });
                LoaderService.hideLoader();
            });
        }

        function addDistrictsLayer(map, scope) {
            return GeoJsonService.districts().then(function (response) {
                L.geoJson(response.data, {
                    style: EumsConfig.districtLayerStyle,
                    onEachFeature: function (feature, layer) {
                        var districtName = feature.properties[EumsConfig.DISTRICT_NAME_LOCATOR] || 'unknown';
                        var districtLayer = Layer.build(map, layer, EumsConfig, scope, districtName);
                        LayerMap.addLayer(districtLayer, districtName.toLowerCase())
                    }
                }).addTo(map);
            });
        }

        return {
            render: function (elementId, layerName, scope) {
                mapScope = scope;
                map = initMap(elementId);

                return addDistrictsLayer(map, scope).then(function () {
                    layerName && this.clickLayer(layerName);
                    return this;
                }.bind(this)).then(function () {
                    LoaderService.showLoader();
                    this.addHeatMap(scope);
                }.bind(this)).then(function () {
                    return this;
                }.bind(this));
            },
            getZoom: function () {
                return map.getZoom();
            },
            addCustomZoomControl: function () {
                if (!zoomControl._zoomInButton) {
                    zoomControl.addTo(map);
                }
            },
            addHeatMap: function (scope) {
                addHeatMapLayer(scope);
            },
            getCenter: function () {
                return map.getCenter();
            },
            setView: function () {
                map.setView(EumsConfig.MAP_OPTIONS.CENTER);
            },
            highlightLayer: function (layerName) {
                LayerMap.selectLayer(layerName.toLowerCase());
            },
            getLayerName: function () {
                return LayerMap.getLayerName();
            },
            getStyle: function (layerName) {
                return LayerMap.getStyle(layerName);
            },
            getHighlightedLayer: function () {
                return LayerMap.getSelectedLayer();
            },
            getLayerCenter: function (layerName) {
                return LayerMap.getLayerCenter(layerName.toLowerCase());
            },
            getLayerBounds: function (layerName) {
                return LayerMap.getLayerBoundsBy(layerName);
            },
            clickLayer: function (layerName, scope) {
                if (layerName) {
                    LayerMap.clickLayer(layerName.toLowerCase(), scope);
                    this.highlightLayer(layerName);
                }
            },
            setDefaultView: function () {
                map.setView(EumsConfig.MAP_OPTIONS.CENTER, EumsConfig.MAP_OPTIONS.ZOOM_LEVEL);
            }
        };
    });

    module.directive('defaultView', function (MapService) {
        return function (scope, element) {
            element.click(function () {
                MapService.setDefaultView();
            });
        }
    });

    module.directive('map', function (MapService, $window) {
        return {
            scope: false,
            link: function (scope, element, attrs) {
                MapService.render(attrs.id, null, scope).then(function (map) {
                    $window.map = map;
                    scope.programme = '';
                });

                scope.clearFilters = function () {
                    $("#select-program").select2("val", "");
                    $("#select-ip").select2("val", "");
                    scope.filter = {programme: '', ip: '', from: '', to: ''};
                };

            }
        }
    })
    .directive('mapFilter', function () {
            return {
                restrict: 'E',
                scope: false,
                templateUrl: '/static/app/views/partials/filters.html'
            }
        })
        .directive('mapSummary', function () {
            return {
                restrict: 'A',
                scope: false,
                templateUrl: '/static/app/views/partials/marker-summary.html'
            }
        })
})
(angular.module('eums.map', ['eums.config', 'eums.ip', 'Programme', 'Delivery', 'DatePicker', 'map.layers', 'DeliveryStats', 'Loader']));

