describe('ExportDeliveryService', function () {
    var mockBackend, exportService, exportCSVEndpoint,
        fakeResponse = {message: 'some message'};
    beforeEach(function () {
        module('ExportDeliveries');
        inject(function ($httpBackend, ExportDeliveriesService, EumsConfig) {
            mockBackend = $httpBackend;
            exportService = ExportDeliveriesService;
            exportCSVEndpoint = EumsConfig.BACKEND_URLS.EXPORT_WAREHOUSE_DELIVERIES;
        })
    });

    it('should call export deliveries endpoint', function(){
        mockBackend.whenGET(exportCSVEndpoint).respond(fakeResponse);
        exportService.export().then(function(response){
             expect(response).toEqual(fakeResponse)
            });
    });
});