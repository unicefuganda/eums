describe('EumsErrorMessageService', function () {
    var mockToastProvider, eumsErrorMessageService;

    beforeEach(function () {
        module('EumsErrorMessage');

        mockToastProvider = jasmine.createSpyObj('mockToastProvider', ['create']);

        module(function ($provide) {
            $provide.value('ngToast', mockToastProvider);
        });

        inject(function (ErrorMessageService) {
            eumsErrorMessageService = ErrorMessageService;
        })
    });

    it('should show error toast when called', function () {
        var errorMessage = "some error message";
        eumsErrorMessageService.showError(errorMessage);
        expect(mockToastProvider.create).toHaveBeenCalledWith({content: errorMessage, class: 'danger'});
    });
});