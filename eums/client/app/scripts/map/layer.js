angular.module('map.layers', ['Delivery', 'DeliveryStats'])
    .factory('LayerMap', function (DeliveryService, DeliveryStatsService) {
        var layerList = {};
        var highlightedLayerName = '';
        var setFilter = function (layerName, scope) {
            var treePosition = scope.data.ipView ? 'IMPLEMENTING_PARTNER' : 'END_USER';
            var filter = layerName ? {location: layerName, treePosition: treePosition} : {treePosition: treePosition};
            return angular.extend(filter, scope.filter);
        };

        return {
            addLayer: function (layer, layerName) {
                layerList[layerName] = layer;
            },
            getLayer: function (layerName) {
                return layerList[layerName.toLowerCase()];
            },
            getLayerName: function () {
                return highlightedLayerName;
            },
            getLayerBoundsBy: function (layerName) {
                return this.getLayer(layerName).getLayerBounds();
            },
            getLayerCenter: function (layerName) {
                return layerList[layerName].getCenter();
            },
            getStyle: function (layerName) {
                return layerList[layerName].getStyle();
            },
            getLayers: function () {
                return layerList;
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
                highlightedLayerName = layerName;
                layerList[layerName].highlight();
            },
            clickLayer: function (layerName) {
                highlightedLayerName = layerName;
                layerList[layerName].click();
            },
            clickedLayer: function () {
                return _.find(layerList, function (layer) {
                    return layer.isClicked();
                });
            },
            isLayerClicked: function () {
                var layer = _.find(layerList, function (layer) {
                    return layer.isClicked();
                });
                return layer != undefined;
            },
            unClickLayers: function () {
                angular.forEach(layerList, function (layer) {
                    layer.unclick();
                });
            },
            changeGlobalStats: function (layerName, scope) {
                var allFilter = setFilter(layerName, scope);
                DeliveryStatsService.getStatsDetails(allFilter, true).then(function (responses) {
                    scope.data.totalStats = responses.data;
                    scope.data.totalStats.location = layerName;
                });
            },
            showResponsesForDistrict: function (layerName, scope) {
                var allFilter = setFilter(layerName, scope);
                DeliveryStatsService.getLatestDeliveries(allFilter).then(function (responses) {
                    scope.data.latestDeliveries = responses.data;
                    scope.data.district = layerName;
                });
            },
            hideResponsesForDistrict: function (scope) {
                scope.data.latestDeliveries = undefined;
                scope.data.district = undefined;
            }

        };
    }).factory('Layer', function (LayerMap) {
        function Layer(map, layer, layerOptions, scope, layerName) {
            var selected = false, layerStyle, clicked = false;

            function init(self) {
                layer
                    .on('mouseover', self.highlight)
                    .on('mouseout', self.unhighlight)
                    .on('click', self.click);
            }

            this.click = function () {
                LayerMap.changeGlobalStats(layerName, scope);
                LayerMap.showResponsesForDistrict(layerName, scope);
                map.fitBounds(layer.getBounds());
                var clickedLayer = LayerMap.clickedLayer();
                if (clickedLayer) {
                    clickedLayer.unclick();
                }
                clicked = true;
            };
            this.setStyle = function (style) {
                layerStyle = style;
                layer.setStyle(style);
            };
            this.getLayerBounds = function () {
                return layer.getBounds();
            };

            this.getStyle = function () {
                return layerStyle;
            };
            this.getCenter = function () {
                return layer.getBounds().getCenter();
            };

            this.highlight = function () {
                layerOptions.districtLayerStyle.weight = 3.5;

                layerOptions.districtLayerStyle.fillColor = layerStyle ? layerStyle.fillColor : layerOptions.districtLayerStyle.fillColor;
                layer.setStyle(layerOptions.districtLayerStyle);
                selected = true;
                if (!LayerMap.isLayerClicked()) {
                    LayerMap.changeGlobalStats(layerName, scope);
                }
            };

            this.unhighlight = function () {
                layer.setStyle(layerStyle || layerOptions.selectedLayerStyle);
                selected = false;
                if (!LayerMap.isLayerClicked()) {
                    LayerMap.changeGlobalStats(undefined, scope);
                }
            };
            this.unclick = function () {
                clicked = false;
            };
            this.isHighlighted = function () {
                return selected;
            };
            this.isClicked = function () {
                return clicked;
            };

            init(this);
        }

        return {
            build: function (map, layer, layerOptions, scope, layerName) {
                return new Layer(map, layer, layerOptions, scope, layerName);
            }
        };

    });