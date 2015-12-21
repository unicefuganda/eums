describe('SystemSettingsController', function () {

    var scope;
    var mockSystemSettingsService, deferredUpdateSettings, deferSettings, mockToast, mockLoaderService, q;
    var deferredLoadSettings;

    beforeEach(function () {
        module('SystemSettings');

        mockSystemSettingsService = jasmine.createSpyObj('mockSystemSettingsService',
            ['isAutoTrack', 'updateAutoTrack', 'getSettings', 'updateSettings']);
        mockLoaderService = jasmine.createSpyObj('mockLoaderService', ['showModal', 'hideModal']);

        inject(function ($controller, $rootScope, $q, $timeout, ngToast) {
            q = $q;
            deferredLoadSettings = $q.defer();
            deferredUpdateSettings = $q.defer();
            deferSettings = $q.defer();
            mockSystemSettingsService.isAutoTrack.and.returnValue(deferredLoadSettings.promise);
            mockSystemSettingsService.updateAutoTrack.and.returnValue(deferredUpdateSettings.promise);
            mockSystemSettingsService.getSettings.and.returnValue(deferSettings.promise);
            mockToast = ngToast;
            spyOn(mockToast, 'create');

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

    it('should get sync start date', function () {
        deferSettings.resolve({sync_start_date: '2015-12-06T00:00:00'});
        scope.$apply();

        expect(mockSystemSettingsService.getSettings).toHaveBeenCalled();
        expect(scope.settings.syncStartDate).toEqual('2015-12-06T00:00:00');
    });

    it('should set an earlier sync start date', function () {
        deferSettings.resolve({sync_start_date: '2015-12-06T00:00:00'});
        scope.$apply();

        scope.settings.syncStartDate = '2015-12-05T00:00:00';
        scope.$digest();

        expect(mockSystemSettingsService.updateSettings).toHaveBeenCalledWith({sync_start_date: '2015-12-05T00:00:00'});
        expect(scope.settings.syncStartDate).toEqual('2015-12-05T00:00:00');
    });

    it('should not set and later sync start date', function() {
        deferSettings.resolve({sync_start_date: '2015-12-06T00:00:00'});
        scope.$apply();

        scope.settings.syncStartDate = '2015-12-07T00:00:00';
        scope.$digest();

        expect(mockSystemSettingsService.updateSettings.calls.count()).toEqual(1);
        expect(mockToast.create).toHaveBeenCalled();
        expect(scope.settings.syncStartDate).toEqual('2015-12-06T00:00:00');
    })
});
