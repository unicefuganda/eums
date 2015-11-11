describe('eums.layers', function () {

    beforeEach(function () {
        module('map.layers');
    });

    describe('LayerMap', function () {
        var layerMap;
        beforeEach(function () {
            inject(function (LayerMap) {
                layerMap = LayerMap;
            });
        });

        it('should add a layer to the layerlist', function () {
            var layer = {'name': 'bukoto'};
            layerMap.addLayer(layer, layer.name);
            expect(layerMap.getLayer(layer.name)).toEqual(layer);
        });

        it('should get selected layer from layersList', function () {
            var layerA = {
                'name': 'Bukoto', isHighlighted: function () {
                    return true;
                }
            };

            var layerB = {
                'name': 'Naguru', isHighlighted: function () {
                    return false;
                }
            };

            layerMap.addLayer(layerA, layerA.name);
            layerMap.addLayer(layerB, layerB.name);

            expect(layerMap.getSelectedLayer()).toEqual({Bukoto: layerA});
        });

        it('should select a layer', function () {
            var layer = jasmine.createSpyObj('layer', ['highlight']);
            layer.name = 'Bukoto';

            layerMap.addLayer(layer, layer.name);
            layerMap.selectLayer(layer.name);
            expect(layer.highlight).toHaveBeenCalled();
        });

        it('should click a layer', function () {
            var layer = jasmine.createSpyObj('layer', ['click']);
            layer.name = 'Bukoto';

            layerMap.addLayer(layer, layer.name);
            layerMap.clickLayer(layer.name);
            expect(layer.click).toHaveBeenCalled();
        });

        it('should get center of a given layer', function () {
            var layer = jasmine.createSpyObj('layer', ['getLayerCenter']);
            layer.name = 'Bukoto';

            layerMap.addLayer(layer, layer.name);
            layer.getLayerCenter(layer.name);
            expect(layer.getLayerCenter).toHaveBeenCalled();
        });

    });

    describe('Layer', function () {
        var layer, mockDeliveryService, scope, deferredAggregates;
        var mockMap, mockMapLayer, mockDeliveryStatsService, mockLayerMap;

        beforeEach(function () {

            mockMap = jasmine.createSpyObj('mockMap', ['fitBounds', 'removeLayer']);
            mockMapLayer = jasmine.createSpyObj('mockMapLayer', ['on', 'setStyle', 'getBounds']);
            mockLayerMap = jasmine.createSpyObj('mockLayerMap', ['layerClicked']);
            mockMapLayer.on.and.returnValue(mockMapLayer);
            mockDeliveryService = jasmine.createSpyObj('mockDeliveryService', ['aggregateResponsesForDistrict', 'orderAllResponsesByDate', 'orderResponsesByDate', 'aggregateStats']);
            mockDeliveryStatsService = jasmine.createSpyObj('mockDeliveryStatsService', ['getStatsDetails', 'getLatestDeliveries']);

            module(function ($provide) {
                $provide.value('DeliveryService', mockDeliveryService);
                $provide.value('DeliveryStatsService', mockDeliveryStatsService);
                $provide.value('LayerMap', mockLayerMap);
            });

            inject(function (Layer, $q, $rootScope) {
                scope = $rootScope.$new();
                layer = Layer;
                deferredAggregates = $q.defer();
                mockDeliveryService.aggregateResponsesForDistrict.and.returnValue(deferredAggregates.promise);
                mockDeliveryService.orderAllResponsesByDate.and.returnValue(deferredAggregates.promise);
                mockDeliveryService.aggregateStats.and.returnValue({});
                mockDeliveryService.orderResponsesByDate.and.returnValue([{}, {}]);
                mockDeliveryStatsService.getStatsDetails.and.returnValue(deferredAggregates.promise);
                mockDeliveryStatsService.getLatestDeliveries.and.returnValue(deferredAggregates.promise);
            });
        });

        describe('METHOD: setStyle', function () {
            it('should set a layer style', function () {
                var style = {color: 'red'};
                var districtLayer = layer.build(mockMap, mockMapLayer, {}, 'Gulu');
                districtLayer.setStyle(style);
                expect(mockMapLayer.setStyle).toHaveBeenCalledWith(style);
            });
        });

        describe('METHOD: click', function () {
            it('should call the on click handler of a layer', function () {
                scope.data = {totalStats: {}, district: '', ipView: false};
                deferredAggregates.resolve({data: 'some deliveries'});

                var optionsMock = jasmine.createSpyObj('optionsMock', ['districtLayerStyle', 'selectedLayerStyle']),
                    districtLayer = layer.build(mockMap, mockMapLayer, optionsMock, scope, 'Gulu');
                districtLayer.click();
                scope.$apply();

                expect(mockDeliveryStatsService.getStatsDetails).toHaveBeenCalled();
                expect(mockDeliveryStatsService.getLatestDeliveries).toHaveBeenCalledWith({
                    treePosition: 'END_USER',
                    location: 'Gulu'
                });
                expect(mockMap.fitBounds).toHaveBeenCalled();
                expect(mockMapLayer.getBounds).toHaveBeenCalled();
                expect(scope.data.latestDeliveries).toEqual('some deliveries');
                expect(scope.data.district).toEqual('Gulu');
                expect(districtLayer.isClicked()).toBe(true);
            });
        });

        describe('METHOD: highlight', function () {
            it('should highlight layer', inject(function () {
                jasmine.createSpyObj('optionsMock', ['onClickHandler']);
                scope.data = {totalStats: {}, district: '', ipView: false};
                deferredAggregates.resolve({data: {key: 'some values'}});
                var optionsMock = {
                    selectedLayerStyle: {fillColor: 'red', weight: 2.0},
                    districtLayerStyle: {fillColor: 'Blue', weight: 3.0}
                };
                var districtLayer = layer.build(mockMap, mockMapLayer, optionsMock, scope, 'Gulu');

                districtLayer.highlight();
                scope.$apply();

                expect(districtLayer.isHighlighted()).toBeTruthy();
                expect(mockMapLayer.setStyle).toHaveBeenCalledWith({fillColor: 'Blue', weight: 3.5});
                expect(mockDeliveryStatsService.getStatsDetails).toHaveBeenCalledWith({
                    treePosition: 'END_USER',
                    location: 'Gulu'
                }, true);
                expect(scope.data.totalStats).toEqual({key: 'some values', location: 'Gulu'});
            }));

            it('should not update global stats on highlight when a clicked layer exists', function(){
                jasmine.createSpyObj('optionsMock', ['onClickHandler']);
                scope.data = {totalStats: {}, district: '', ipView: false};
                deferredAggregates.resolve({data: {key: 'some values'}});
                var optionsMock = {
                    selectedLayerStyle: {fillColor: 'red', weight: 2.0},
                    districtLayerStyle: {fillColor: 'Blue', weight: 3.0}
                };
                mockLayerMap.layerClicked.and.returnValue(true);
                var districtLayer = layer.build(mockMap, mockMapLayer, optionsMock, scope, 'Gulu');

                districtLayer.highlight();
                scope.$apply();

                expect(districtLayer.isHighlighted()).toBeTruthy();
                expect(mockLayerMap.layerClicked).toHaveBeenCalled();
                expect(mockDeliveryStatsService.getStatsDetails).not.toHaveBeenCalled();
            });

            it('should not update global stats on un-highlight when a clicked layer exists', function () {
                jasmine.createSpyObj('optionsMock', ['onClickHandler']);
                scope.data = {totalStats: {}, district: '', ipView: false};
                deferredAggregates.resolve({data: {key: 'some values'}});
                var optionsMock = {
                    selectedLayerStyle: {fillColor: 'red', weight: 2.0},
                    districtLayerStyle: {fillColor: 'Blue', weight: 3.0}
                };
                mockLayerMap.layerClicked.and.returnValue(true);
                var districtLayer = layer.build(mockMap, mockMapLayer, optionsMock, scope, 'Gulu');

                districtLayer.unhighlight();
                scope.$apply();

                expect(districtLayer.isHighlighted()).toBeFalsy();
                expect(mockLayerMap.layerClicked).toHaveBeenCalled();
                expect(mockDeliveryStatsService.getStatsDetails).not.toHaveBeenCalled();
            });


        });

        describe('METHOD: getCenter', function () {
            it('should get the center of a layer', function () {
                var mockBounds = jasmine.createSpyObj('mockBounds', ['getCenter']);
                mockMapLayer.getBounds.and.returnValue(mockBounds);
                var districtLayer = layer.build(mockMap, mockMapLayer, {}, {}, 'Gulu');

                districtLayer.getCenter();
                expect(mockMapLayer.getBounds).toHaveBeenCalled();
                expect(mockBounds.getCenter).toHaveBeenCalled();
            });
        });

        describe('METHOD: getLayerBounds', function () {
            it('should get the center of a layer', function () {
                var mockBounds = jasmine.createSpyObj('mockBounds', ['getCenter']);
                mockMapLayer.getBounds.and.returnValue(mockBounds);
                var districtLayer = layer.build(mockMap, mockMapLayer, {}, {}, 'Gulu');

                districtLayer.getLayerBounds();
                expect(mockMapLayer.getBounds).toHaveBeenCalled();
            });
        });


    });

});