angular.module('map.layers', ['DistributionPlan'])
    .factory('LayerMap', function () {
        var layerList = {};

        function getRandomCoordinates(bound) {
            return {
                lat: Math.random() * (bound._northEast.lat - bound._southWest.lat) + bound._southWest.lat,
                lng: Math.random() * (bound._northEast.lng - bound._southWest.lng) + bound._southWest.lng
            };
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
                return getRandomCoordinates(bound);
            },
            getLayerBoundsBy: function (layerName) {
                return this.getLayer(layerName).getLayerBounds();
            },
            getLayerCenter: function (layerName) {
                return layerList[layerName].getCenter();
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
                layerList[layerName].highlight();
            },
            clickLayer: function (layerName) {
                layerList[layerName].click();
            }
        };
    }).factory('Layer', function (DistributionPlanService) {
        function Layer(map, layer, layerOptions, scope, layerName) {
            var selected = false, layerStyle;

            function init(self) {
                layer
                    .on('mouseover', self.highlight)
                    .on('mouseout', self.unhighlight)
                    .on('click', self.click);
            }

            this.click = function () {
                DistributionPlanService.aggregateResponsesForDistrict(layerName).then(function (aggregates) {
                    scope.totalStats = aggregates;
                });
                map.fitBounds(layer.getBounds());
            };
            this.setStyle = function (style) {
                layerStyle = style;
                layer.setStyle(style);
            };
            this.getLayerBounds = function () {
                return layer.getBounds();
            };

            this.getCenter = function () {
                return layer.getBounds().getCenter();
            };

            this.highlight = function () {
                layerOptions.districtLayerStyle.weight = 3.5;
                layerOptions.districtLayerStyle.fillColor = layerStyle && layerStyle.fillColor;
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