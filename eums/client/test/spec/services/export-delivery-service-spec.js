describe('ExportDeliveryService', function () {
    var mockBackend, exportService, exportCSVEndpoint,
        fakeResponse = {message: 'some message'};
    beforeEach(function () {
        module('ExportDeliveries');
        inject(function ($httpBackend, ExportDeliveriesService, EumsConfig) {
            mockBackend = $httpBackend;
            exportService = ExportDeliveriesService;
            exportCSVEndpoint = EumsConfig.BACKEND_URLS.DELIVERY_EXPORTS;
        })
    });

    it('should call exporter deliveries endpoint', function(){
        var type_filter = 'haha';
        mockBackend.whenGET(exportCSVEndpoint + '?type=' + type_filter).respond(fakeResponse);
        exportService.export(type_filter).then(function(response){
             expect(response).toEqual(fakeResponse)
            });
    });
});