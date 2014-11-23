angular.module('map.layers', ['DistributionPlan'])
    .factory('LayerMap', function () {
        var layerList = {};
        var highlightedLayerName = '';

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
            }
        };
    }).factory('Layer', function (DistributionPlanService) {
        function changeGlobalStats(layerName, scope) {
            scope.$apply(function () {
                scope.data.totalStats = DistributionPlanService.aggregateStats(scope.allResponsesMap, layerName);
            });

        }

        function showResponsesForDistrict(layerName, scope) {
            var allResponses = DistributionPlanService.orderResponsesByDate(scope.allResponsesMap, layerName);
            scope.$apply(function () {
                scope.data.responses = allResponses.slice(0, 5);
                scope.data.district = layerName;
            });
        }

        function Layer(map, layer, layerOptions, scope, layerName) {
            var selected = false, layerStyle;

            function init(self) {
                layer
                    .on('mouseover', self.highlight)
                    .on('mouseout', self.unhighlight)
                    .on('click', self.click);
            }

            this.click = function () {
                changeGlobalStats(layerName, scope);
                showResponsesForDistrict(layerName, scope);
                map.fitBounds(layer.getBounds());
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
            };

            this.unhighlight = function () {
                layer.setStyle(layerStyle || layerOptions.selectedLayerStyle);
                selected = false;
            };

            this.isHighlighted = function () {
                return selected;
            };

            init(this);
        }

        return {
            build: function (map, layer, layerOptions, scope, layerName) {
                return new Layer(map, layer, layerOptions, scope, layerName);
            }
        };

    });