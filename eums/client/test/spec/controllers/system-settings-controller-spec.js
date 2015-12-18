describe('SystemSettingsController', function () {

    var scope;
    var mockSystemSettingsService, mockLoaderService, q;
    var deferredLoadSettings;

    beforeEach(function () {
        module('SystemSettings');

        mockSystemSettingsService = jasmine.createSpyObj('mockSystemSettingsService', ['isAutoTrack', 'updateAutoTrack']);
        mockLoaderService = jasmine.createSpyObj('mockLoaderService', ['showModal', 'hideModal']);

        inject(function ($controller, $rootScope, $q, $timeout) {
            q = $q;
            deferredLoadSettings = $q.defer();
            deferredUpdateSettings = $q.defer();
            mockSystemSettingsService.isAutoTrack.and.returnValue(deferredLoadSettings.promise);
            mockSystemSettingsService.updateAutoTrack.and.returnValue(deferredUpdateSettings.promise);

            scope = $rootScope.$new();
            timeout = $timeout;

            $controller('SystemSettingsController', {
                $scope: scope,
                LoaderService: mockLoaderService,
                SystemSettingsService: mockSystemSettingsService
            });
        });
    });

    it('should load current auto track setting', function () {
        deferredLoadSettings.resolve(true);
        scope.$apply();

        expect(mockSystemSettingsService.isAutoTrack).toHaveBeenCalled();
        expect(scope.isSelected).toBe(true);
    });

    it('should cancel auto track setting', function () {
        scope.isSelected = true;
        spyOn(scope, 'cancelAutoTrack').and.callThrough();
        scope.cancelAutoTrack();
        scope.$apply();

        expect(scope.cancelAutoTrack).toHaveBeenCalled();
        expect(scope.isSelected).toBe(false);
        expect(mockLoaderService.hideModal).toHaveBeenCalled();
    });

    it('should confirm auto track setting', function () {
        scope.isSelected = true;
        deferredUpdateSettings.resolve(scope.isSelected);
        spyOn(scope, 'confirmAutoTrack').and.callThrough();
        scope.confirmAutoTrack();
        scope.$apply();

        expect(scope.confirmAutoTrack).toHaveBeenCalled();
        expect(mockSystemSettingsService.updateAutoTrack).toHaveBeenCalled();
        expect(scope.isSelected).toBe(true);
        expect(mockLoaderService.hideModal).toHaveBeenCalled();
    });
});
