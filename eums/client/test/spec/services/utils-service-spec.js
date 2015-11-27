describe('Utils Service', function () {
    var sysUtilService;

    beforeEach(function () {
        module('SysUtils');
        inject(function (SysUtilsService) {
            sysUtilService = SysUtilsService
        });
    });

    it('should format as 10-Oct-2015 when 10/10/2015 is given', function () {
        var resultData = sysUtilService.formatDate("10/10/2015");
        expect(resultData).toEqual("10-Oct-2015");
    });

    it('should format as empty string when empty string is given', function () {
        var resultData = sysUtilService.formatDate("");
        expect(resultData).toEqual("");
    });

    it('should format as empty string when nothing is given', function () {
        var resultData = sysUtilService.formatDate();
        expect(resultData).toEqual("");
    });

    it('should format as empty string when null is given', function () {
        var resultData = sysUtilService.formatDate(null);
        expect(resultData).toEqual("");
    });
});

