describe('Utils Service', function () {
    var utilService;

    beforeEach(function () {
        module('SysUtils');
        inject(function (UtilsService) {
            utilService = UtilsService
        });
    });

    it('should format 10/10/2015 as 10-Oct-2015', function () {
        var resultData = utilService.formatDate("10/10/2015");
        expect(resultData).toEqual("10-Oct-2015");
    });

    it('should format empty string as empty string', function () {
        var resultData = utilService.formatDate("");
        expect(resultData).toEqual("");
    });
});

