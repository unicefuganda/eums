describe('SystemSettingsController', function () {

    var scope;
    var mockSystemSettingsService, deferGetSettings, deferUpdateSettings, mockToast, mockLoaderService, q;

    beforeEach(function () {
        module('SystemSettings');

        mockSystemSettingsService = jasmine.createSpyObj('mockSystemSettingsService', ['getSettings', 'updateSettings']);
        mockLoaderService = jasmine.createSpyObj('mockLoaderService', ['showModal', 'hideModal']);

        inject(function ($controller, $rootScope, $q, ngToast) {
            q = $q;
            deferGetSettings = $q.defer();
            deferUpdateSettings = $q.defer();
            mockSystemSettingsService.getSettings.and.returnValue(deferGetSettings.promise);
            mockSystemSettingsService.updateSettings.and.returnValue(deferUpdateSettings.promise);
            mockToast = ngToast;
            spyOn(mockToast, 'create');

            scope = $rootScope.$new();

            $controller('SystemSettingsController', {
                $scope: scope,
                LoaderService: mockLoaderService,
                SystemSettingsService: mockSystemSettingsService
            });
        });
    });

    it('should load current auto track setting', function () {
        deferGetSettings.resolve({auto_track: true});
        scope.$apply();

        expect(mockSystemSettingsService.getSettings).toHaveBeenCalled();
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
        deferUpdateSettings.resolve({auto_track: scope.isSelected});
        spyOn(scope, 'confirmAutoTrack').and.callThrough();
        scope.confirmAutoTrack();
        scope.$apply();

        expect(scope.confirmAutoTrack).toHaveBeenCalled();
        expect(mockSystemSettingsService.updateSettings).toHaveBeenCalled();
        expect(scope.isSelected).toBe(true);
        expect(mockLoaderService.hideModal).toHaveBeenCalled();
    });

    it('should get sync start date', function () {
        deferGetSettings.resolve({sync_start_date: new Date('2015-12-06T00:00:00')});
        scope.$apply();

        expect(mockSystemSettingsService.getSettings).toHaveBeenCalled();
        expect(scope.settings.syncStartDate).toEqual(new Date('2015-12-06T00:00:00'));
    });

    it('should set an earlier sync start date', function () {
        deferUpdateSettings.resolve({sync_start_date: new Date('2015-12-06T00:00:00')});
        scope.$apply();

        scope.settings.syncStartDate = new Date('2015-12-05T00:00:00');
        scope.$digest();

        expect(mockSystemSettingsService.updateSettings).toHaveBeenCalledWith({sync_start_date: new Date('2015-12-05T00:00:00')});
        expect(scope.settings.syncStartDate).toEqual(new Date('2015-12-05T00:00:00'));
    });

    it('should not set and later sync start date', function () {
        deferGetSettings.resolve({sync_start_date: '2015-12-06T00:00:00'});
        scope.$apply();

        scope.settings.syncStartDate = new Date('2015-12-07T00:00:00');
        scope.$digest();

        expect(mockSystemSettingsService.updateSettings.calls.count()).toEqual(0);
        expect(mockToast.create).toHaveBeenCalled();
        expect(scope.settings.syncStartDate).toEqual(new Date('2015-12-06T00:00:00'))
    });

    it('should cancel notification message setting', function () {
        scope.notificationMessage = 'changed message';
        scope.currentNotificationMessage = 'original message';
        spyOn(scope, 'cancelNotificationMessage').and.callThrough();
        scope.cancelNotificationMessage();
        scope.$apply();

        expect(scope.cancelNotificationMessage).toHaveBeenCalled();
        expect(scope.notificationMessage).toEqual(scope.currentNotificationMessage);
    });

    it('should save notification message setting', function () {
        scope.notificationMessage = 'updated message';
        scope.currentNotificationMessage = 'message';
        var formValid = true;
        deferUpdateSettings.resolve({'notification_message': scope.notificationMessage});
        spyOn(scope, 'saveNotificationMessage').and.callThrough(formValid);
        scope.saveNotificationMessage(formValid);
        scope.$apply();

        expect(mockSystemSettingsService.updateSettings).toHaveBeenCalled();
        expect(scope.saveNotificationMessage).toHaveBeenCalledWith(formValid);
        expect(scope.currentNotificationMessage).toEqual(scope.notificationMessage);
        expect(mockToast.create).toHaveBeenCalled();
    });

    it('should not save notification message setting', function () {
        scope.notificationMessage = 'changed message';
        scope.currentNotificationMessage = 'original message';
        var formValid = false;
        spyOn(scope, 'saveNotificationMessage').and.callThrough(formValid);
        scope.saveNotificationMessage(formValid);
        scope.$apply();

        expect(scope.saveNotificationMessage).toHaveBeenCalledWith(formValid);
        expect(scope.currentNotificationMessage).toBe('original message');
        expect(mockToast.create).toHaveBeenCalled();
    });
});
