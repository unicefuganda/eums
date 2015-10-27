angular.module('map.layers', ['Delivery', 'DeliveryStats'])
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
    }).factory('Layer', function (DeliveryService, DeliveryStatsService) {
        function changeGlobalStats(layerName, scope) {
            var treePosition = scope.ipView? 'IMPLEMENTING_PARTNER': 'END_USER';
            var filter = layerName? {location: layerName, treePosition: treePosition} : {treePosition: treePosition};
            var allFilter = angular.extend(filter, scope.filter);
            scope.$apply(function () {
                DeliveryStatsService.getStats(allFilter).then(function(responses){
                    scope.data.totalStats =responses.data;
                    scope.data.totalStats.location = layerName;
                });
            });
        }


        function showResponsesForDistrict(layerName, responses, scope) {
            var allResponses = DeliveryService.getLatestRespondedItemDeliveries(responses, layerName, 3);
            scope.$apply(function () {
                scope.data.responses = allResponses;
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
                var responses = scope.allResponsesMap;
                changeGlobalStats(layerName, scope);
                showResponsesForDistrict(layerName, responses, scope);
                map.fitBounds(layer.getBounds());
                //window.map.addCustomZoomControl();
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

                changeGlobalStats(layerName, scope);
            };

            this.unhighlight = function () {
                layer.setStyle(layerStyle || layerOptions.selectedLayerStyle);
                selected = false;

                changeGlobalStats(undefined, scope);
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