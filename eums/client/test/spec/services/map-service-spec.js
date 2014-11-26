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
            var layerA = {'name': 'Bukoto', isHighlighted: function () {
                return true;
            }};

            var layerB = {'name': 'Naguru', isHighlighted: function () {
                return false;
            }};

            layerMap.addLayer(layerA, layerA.name);
            layerMap.addLayer(layerB, layerB.name);

            expect(layerMap.getSelectedLayer()).toEqual({ Bukoto: layerA });
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
        var layer, mockDistributionPlanService, scope, deferredAggregates;
        var mockMap, mockMapLayer;

        beforeEach(function () {

            mockMap = jasmine.createSpyObj('mockMap', ['fitBounds', 'removeLayer']);
            mockMapLayer = jasmine.createSpyObj('mockMapLayer', ['on', 'setStyle', 'getBounds']);
            mockMapLayer.on.and.returnValue(mockMapLayer);
            mockDistributionPlanService = jasmine.createSpyObj('mockDistributionPlanService', ['aggregateResponsesForDistrict', 'orderAllResponsesByDate', 'orderResponsesByDate', 'aggregateStats']);

            module(function ($provide) {
                $provide.value('DistributionPlanService', mockDistributionPlanService);
            });

            inject(function (Layer, $q, $rootScope) {
                scope = $rootScope.$new();
                layer = Layer;
                deferredAggregates = $q.defer();
                mockDistributionPlanService.aggregateResponsesForDistrict.and.returnValue(deferredAggregates.promise);
                mockDistributionPlanService.orderAllResponsesByDate.and.returnValue(deferredAggregates.promise);
                mockDistributionPlanService.aggregateStats.and.returnValue({});
                mockDistributionPlanService.orderResponsesByDate.and.returnValue([
                    {},
                    {}
                ]);
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
            xit('should call the on click handler of a layer', function () {
                scope.allResponsesMap = {};
                scope.data = {totalStats: {}};

                var optionsMock = jasmine.createSpyObj('optionsMock', ['districtLayerStyle', 'selectedLayerStyle']),
                    districtLayer = layer.build(mockMap, mockMapLayer, optionsMock, scope, 'Gulu');
                districtLayer.click();
//                expect(mockDistributionPlanService.aggregateResponsesForDistrict).toHaveBeenCalledWith('Gulu');
                expect(mockDistributionPlanService.orderResponsesByDate).toHaveBeenCalledWith({}, 'Gulu');
            });
        });

        describe('METHOD: highlight', function () {
            it('should highlight layer', function () {
                var optionsMock = jasmine.createSpyObj('optionsMock', ['onClickHandler']);
                optionsMock = { selectedLayerStyle: { fillColor: 'red', weight: 2.0}, districtLayerStyle: {fillColor: 'Blue', weight: 3.0}};
                var districtLayer = layer.build(mockMap, mockMapLayer, optionsMock, {}, 'Gulu');

                districtLayer.highlight();
                expect(mockMapLayer.setStyle).toHaveBeenCalledWith({ fillColor: 'Blue', weight: 3.5 });
                expect(districtLayer.isHighlighted()).toBeTruthy();
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