describe('eums.layers', function () {

    beforeEach(function () {
        module('map.layers');
    });

    describe('LayerMap', function () {
        var layerMap, mockDeliveryService, mockDeliveryStatsService, deferredAggregates, scope, layerFactory;
        beforeEach(function () {

            mockDeliveryService = jasmine.createSpyObj('mockDeliveryService', ['aggregateResponsesForDistrict', 'orderAllResponsesByDate', 'orderResponsesByDate', 'aggregateStats']);
            mockDeliveryStatsService = jasmine.createSpyObj('mockDeliveryStatsService', ['getStatsDetails', 'getLatestDeliveries']);

            module(function ($provide) {
                $provide.value('DeliveryService', mockDeliveryService);
                $provide.value('DeliveryStatsService', mockDeliveryStatsService);
            });

            inject(function (LayerMap, $q, $rootScope, Layer) {
                scope = $rootScope.$new();
                layerMap = LayerMap;
                layerFactory = Layer;
                deferredAggregates = $q.defer();
                mockDeliveryService.aggregateResponsesForDistrict.and.returnValue(deferredAggregates.promise);
                mockDeliveryService.orderAllResponsesByDate.and.returnValue(deferredAggregates.promise);
                mockDeliveryService.aggregateStats.and.returnValue({});
                mockDeliveryService.orderResponsesByDate.and.returnValue([{}, {}]);
                mockDeliveryStatsService.getStatsDetails.and.returnValue(deferredAggregates.promise);
                mockDeliveryStatsService.getLatestDeliveries.and.returnValue(deferredAggregates.promise);
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

        it('should change global stats', function () {
            scope.data = {ipView: false, totalStats: {}};
            layerMap.changeGlobalStats('Gulu', scope);
            deferredAggregates.resolve({data: {key: 'some data'}});
            scope.$apply();
            expect(mockDeliveryStatsService.getStatsDetails).toHaveBeenCalledWith({location: 'Gulu', treePosition: 'END_USER'}, true);
            expect(scope.data.totalStats).toEqual({key: 'some data', location: 'Gulu'});
        });

        it('should district responses', function () {
            scope.data = {ipView: true};
            layerMap.showResponsesForDistrict('Gulu', scope);
            deferredAggregates.resolve({data: 'some data'});
            scope.$apply();
            expect(mockDeliveryStatsService.getLatestDeliveries).toHaveBeenCalledWith({
                location: 'Gulu',
                treePosition: 'IMPLEMENTING_PARTNER'
            });
            expect(scope.data.latestDeliveries).toEqual('some data');
            expect(scope.data.district).toEqual('Gulu');
        });

        it('should hide district responses', function () {
            scope.data = {ipView: true};
            layerMap.hideResponsesForDistrict(scope);
            scope.$apply();
            expect(scope.data.latestDeliveries).not.toBeDefined();
            expect(scope.data.district).not.toBeDefined();
        });

        function setupLayers() {
            var mockMap = jasmine.createSpyObj('mockMap', ['fitBounds', 'removeLayer']);
            var mockLeafletLayer = jasmine.createSpyObj('mockMapLayer', ['on', 'setStyle', 'getBounds']);
            mockLeafletLayer.on.and.returnValue(mockLeafletLayer);
            var optionsMock = jasmine.createSpyObj('optionsMock', ['districtLayerStyle', 'selectedLayerStyle']);
            var gulu = layerFactory.build(mockMap, mockLeafletLayer, optionsMock, scope, 'Gulu');
            var wakiso = layerFactory.build(mockMap, mockLeafletLayer, optionsMock, scope, 'wakiso');
            layerMap.addLayer(gulu, 'Gulu');
            layerMap.addLayer(wakiso, 'wakiso');
            return gulu;
        }

        it('should unclick layers', function () {
            scope.data = {ipView: true};
            var gulu = setupLayers();
            gulu.click();
            expect(gulu.isClicked()).toBeTruthy();
            layerMap.unClickLayers();
            expect(gulu.isClicked()).toBeFalsy();
        });

        it('should return layer clicked', function () {
            scope.data = {ipView: true};
            var gulu = setupLayers();
            gulu.click();
            expect(layerMap.isLayerClicked()).toBeTruthy();
        });

        it('should return clicked layer', function () {
            scope.data = {ipView: true};
            var gulu = setupLayers();
            gulu.click();
            expect(layerMap.clickedLayer()).toBe(gulu);
        });
    });

    describe('Layer', function () {
        var layer, scope, deferredAggregates;
        var mockMap, mockMapLayer, mockLayerMap;

        beforeEach(function () {

            mockMap = jasmine.createSpyObj('mockMap', ['fitBounds', 'removeLayer']);
            mockMapLayer = jasmine.createSpyObj('mockMapLayer', ['on', 'setStyle', 'getBounds']);
            mockLayerMap = jasmine.createSpyObj('mockLayerMap', ['isLayerClicked', 'changeGlobalStats', 'showResponsesForDistrict', 'clickedLayer']);
            mockMapLayer.on.and.returnValue(mockMapLayer);

            module(function ($provide) {
                $provide.value('LayerMap', mockLayerMap);
            });

            inject(function (Layer, $q, $rootScope) {
                scope = $rootScope.$new();
                layer = Layer;
                deferredAggregates = $q.defer();
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

                var optionsMock = jasmine.createSpyObj('optionsMock', ['districtLayerStyle', 'selectedLayerStyle']),
                    districtLayer = layer.build(mockMap, mockMapLayer, optionsMock, scope, 'Gulu');
                districtLayer.click();
                scope.$apply();

                expect(mockLayerMap.changeGlobalStats).toHaveBeenCalled();
                expect(mockLayerMap.showResponsesForDistrict).toHaveBeenCalled();

                expect(mockMap.fitBounds).toHaveBeenCalled();
                expect(mockMapLayer.getBounds).toHaveBeenCalled();
                expect(districtLayer.isClicked()).toBe(true);
            });
        });

        describe('METHOD: highlight', function () {
            it('should highlight layer', inject(function () {
                jasmine.createSpyObj('optionsMock', ['onClickHandler']);
                scope.data = {totalStats: {}, district: '', ipView: false};
                var optionsMock = {
                    selectedLayerStyle: {fillColor: 'red', weight: 2.0},
                    districtLayerStyle: {fillColor: 'Blue', weight: 3.0}
                };
                var districtLayer = layer.build(mockMap, mockMapLayer, optionsMock, scope, 'Gulu');

                districtLayer.highlight();
                scope.$apply();


                expect(districtLayer.isHighlighted()).toBeTruthy();
                expect(mockMapLayer.setStyle).toHaveBeenCalledWith({fillColor: 'Blue', weight: 3.5});
                expect(mockLayerMap.changeGlobalStats).toHaveBeenCalled();
            }));

            it('should not update global stats on highlight when a clicked layer exists', function () {
                jasmine.createSpyObj('optionsMock', ['onClickHandler']);
                scope.data = {totalStats: {}, district: '', ipView: false};
                var optionsMock = {
                    selectedLayerStyle: {fillColor: 'red', weight: 2.0},
                    districtLayerStyle: {fillColor: 'Blue', weight: 3.0}
                };
                mockLayerMap.isLayerClicked.and.returnValue(true);

                var districtLayer = layer.build(mockMap, mockMapLayer, optionsMock, scope, 'Gulu');

                districtLayer.highlight();
                scope.$apply();

                expect(districtLayer.isHighlighted()).toBeTruthy();
                expect(mockLayerMap.changeGlobalStats).not.toHaveBeenCalled();
            });

            it('should not update global stats on un-highlight when a clicked layer exists', function () {
                jasmine.createSpyObj('optionsMock', ['onClickHandler']);
                scope.data = {totalStats: {}, district: '', ipView: false};
                var optionsMock = {
                    selectedLayerStyle: {fillColor: 'red', weight: 2.0},
                    districtLayerStyle: {fillColor: 'Blue', weight: 3.0}
                };
                mockLayerMap.isLayerClicked.and.returnValue(true);
                var districtLayer = layer.build(mockMap, mockMapLayer, optionsMock, scope, 'Gulu');

                districtLayer.unhighlight();
                scope.$apply();

                expect(districtLayer.isHighlighted()).toBeFalsy();
                expect(mockLayerMap.isLayerClicked).toHaveBeenCalled();
                expect(mockLayerMap.changeGlobalStats).not.toHaveBeenCalled();
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