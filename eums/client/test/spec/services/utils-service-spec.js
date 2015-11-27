describe('Utils Service', function () {
    var utilService;

    beforeEach(function () {
        module('SysUtils');
        inject(function (UtilsService) {
            utilService = UtilsService
        });
    });

    it('should format data as DD-MM-YYYY', function () {
        var resultData = utilService.formatDate("10/10/2015");
        expect(resultData).toEqual("10-Oct-2015");
    });
});

