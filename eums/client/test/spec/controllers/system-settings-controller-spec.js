describe('SystemSettingsController', function () {

    var scope, rootScope;
    var mockSystemSettingsService, deferGetSettings, deferUpdateSettings, mockToast, mockLoaderService, q;

    beforeEach(function () {
        module('SystemSettings');

        mockSystemSettingsService = jasmine.createSpyObj('mockSystemSettingsService', ['getSettings', 'updateSettings']);
        mockLoaderService = jasmine.createSpyObj('mockLoaderService', ['showModal', 'hideModal']);

        inject(function ($controller, $rootScope, $q, ngToast) {
            scope = $rootScope.$new();
            rootScope = $rootScope;
            q = $q;
            deferGetSettings = $q.defer();
            deferUpdateSettings = $q.defer();
            mockSystemSettingsService.getSettings.and.returnValue(deferGetSettings.promise);
            mockSystemSettingsService.updateSettings.and.returnValue(deferUpdateSettings.promise);
            mockToast = ngToast;
            spyOn(mockToast, 'create');

            $controller('SystemSettingsController', {
                $scope: scope,
                $rootScope: rootScope,
                LoaderService: mockLoaderService,
                SystemSettingsService: mockSystemSettingsService
            });
        });
    });

    describe('For auto track', function () {
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
    });

    describe('For vision sync', function () {
        it('should get sync start date and end date', function () {
            deferGetSettings.resolve({
                sync_start_date: new Date('2015-12-06'),
                sync_end_date: new Date('2016-06-06')
            });
            scope.$apply();

            expect(mockSystemSettingsService.getSettings).toHaveBeenCalled();
            expect(scope.settings.syncStartDate).toEqual(new Date('2015-12-06'));
            expect(scope.settings.syncEndDate).toEqual(new Date('2016-06-06'));
        });

        it('should set valid sync date', function () {
            deferGetSettings.resolve({
                sync_start_date: new Date('2015-12-06'),
                sync_end_date: new Date('2016-06-06')
            });
            scope.$apply();

            scope.settings.syncStartDate = new Date('2015-12-05');
            scope.settings.syncEndDate = new Date('2016-06-05');
            spyOn(scope, 'clickSyncBtn').and.callThrough();
            scope.clickSyncBtn();
            scope.$apply();

            expect(scope.clickSyncBtn).toHaveBeenCalled();
            expect(mockLoaderService.showModal).toHaveBeenCalled();

            spyOn(scope, 'confirmSync').and.callThrough();
            scope.confirmSync();
            scope.$apply();

            expect(mockLoaderService.hideModal).toHaveBeenCalled();
            expect(scope.confirmSync).toHaveBeenCalled();
            expect(mockSystemSettingsService.updateSettings).toHaveBeenCalledWith({
                sync_start_date: '2015-12-05', sync_end_date: '2016-06-05'
            });
            expect(scope.settings.syncStartDate).toEqual(new Date('2015-12-05'));
            expect(scope.settings.syncEndDate).toEqual(new Date('2016-06-05'));
        });

        it('should cancel an vision sync', function () {
            deferGetSettings.resolve({
                sync_start_date: new Date('2015-12-06'),
                sync_end_date: new Date('2016-06-06')
            });
            scope.$apply();

            scope.settings.syncStartDate = new Date('2015-12-05');
            scope.settings.syncEndDate = new Date('2016-06-05');
            spyOn(scope, 'clickSyncBtn').and.callThrough();
            scope.clickSyncBtn();
            scope.$apply();

            expect(scope.clickSyncBtn).toHaveBeenCalled();
            expect(mockLoaderService.showModal).toHaveBeenCalled();

            spyOn(scope, 'cancelSync').and.callThrough();
            scope.cancelSync();
            scope.$apply();

            expect(mockLoaderService.hideModal).toHaveBeenCalled();
            expect(scope.cancelSync).toHaveBeenCalled();
            expect(mockSystemSettingsService.updateSettings.calls.count()).toEqual(0);
            expect(scope.settings.syncStartDate).toEqual(new Date('2015-12-06'));
            expect(scope.settings.syncEndDate).toEqual(new Date('2016-06-06'));
        });

        it('should not set and sync when dates are not changed', function () {
            deferGetSettings.resolve({
                sync_start_date: new Date('2015-12-06'),
                sync_end_date: new Date('2016-06-06')
            });
            scope.$apply();

            scope.settings.syncStartDate = new Date('2015-12-07');
            scope.settings.syncEndDate = new Date('2015-08-07');
            spyOn(scope, 'clickSyncBtn').and.callThrough();
            scope.clickSyncBtn();
            scope.$apply();

            expect(scope.clickSyncBtn).toHaveBeenCalled();
            expect(mockLoaderService.showModal).toHaveBeenCalled();
            scope.cancelSync();
            scope.$apply();

            expect(mockLoaderService.hideModal).toHaveBeenCalled();
            expect(mockSystemSettingsService.updateSettings.calls.count()).toEqual(0);
            expect(scope.settings.syncStartDate).toEqual(new Date('2015-12-06'));
            expect(scope.settings.syncEndDate).toEqual(new Date('2016-06-06'));
        });
    });

    describe('For subdivision-name/district-label', function () {
        it('should cancel subdivision-name', function () {
            scope.districtLabel = 'changed district';
            scope.currentDistrictLabel = 'original district';
            spyOn(scope, 'cancelMessages').and.callThrough();
            scope.cancelMessages();
            scope.$apply();

            expect(scope.cancelMessages).toHaveBeenCalled();
            expect(scope.districtLabel).toEqual('original district');
        });

        it('should save subdivision-name', function () {
            scope.districtLabel = 'updated district';
            scope.currentDistrictLabel = 'district';
            var formValid = true;
            deferUpdateSettings.resolve({'district_label': scope.districtLabel});
            spyOn(scope, 'saveMessages').and.callThrough(formValid);
            scope.saveMessages(formValid);
            scope.$apply();

            expect(mockSystemSettingsService.updateSettings).toHaveBeenCalled();
            expect(scope.saveMessages).toHaveBeenCalledWith(formValid);
            expect(scope.currentDistrictLabel).toEqual(scope.districtLabel);
            expect(mockToast.create).toHaveBeenCalled();
        });

        it('should not save subdivision-name when form is invalid', function () {
            scope.districtLabel = 'changed district';
            scope.currentDistrictLabel = 'original district';
            var formValid = false;
            spyOn(scope, 'saveMessages').and.callThrough(formValid);
            scope.saveMessages(formValid);
            scope.$apply();

            expect(scope.saveMessages).toHaveBeenCalledWith(formValid);
            expect(scope.currentDistrictLabel).toBe('original district');
            expect(mockToast.create).toHaveBeenCalled();
        });
    });

    describe('For notification message', function () {
        it('should cancel notification message setting', function () {
            scope.notificationMessage = 'changed message';
            scope.currentNotificationMessage = 'original message';
            spyOn(scope, 'cancelMessages').and.callThrough();
            scope.cancelMessages();
            scope.$apply();

            expect(scope.cancelMessages).toHaveBeenCalled();
            expect(scope.notificationMessage).toEqual(scope.currentNotificationMessage);
        });

        it('should save notification message setting', function () {
            scope.notificationMessage = 'updated message';
            scope.currentNotificationMessage = 'message';
            var formValid = true;
            deferUpdateSettings.resolve({'notification_message': scope.notificationMessage});
            spyOn(scope, 'saveMessages').and.callThrough(formValid);
            scope.saveMessages(formValid);
            scope.$apply();

            expect(mockSystemSettingsService.updateSettings).toHaveBeenCalled();
            expect(scope.saveMessages).toHaveBeenCalledWith(formValid);
            expect(scope.currentNotificationMessage).toEqual(scope.notificationMessage);
            expect(mockToast.create).toHaveBeenCalled();
        });

        it('should not save notification message setting when form is invalid', function () {
            scope.notificationMessage = 'changed message';
            scope.currentNotificationMessage = 'original message';
            var formValid = false;
            spyOn(scope, 'saveMessages').and.callThrough(formValid);
            scope.saveMessages(formValid);
            scope.$apply();

            expect(scope.saveMessages).toHaveBeenCalledWith(formValid);
            expect(scope.currentNotificationMessage).toBe('original message');
            expect(mockToast.create).toHaveBeenCalled();
        });
    });

    describe('For country name', function () {
        it('should cancel country name', function () {
            scope.countryLabel = 'uganda';
            scope.currentCountryLabel = 'somalia';
            rootScope.countryLabel = 'somalia';
            spyOn(scope, 'cancelMessages').and.callThrough();
            scope.cancelMessages();
            scope.$apply();

            expect(scope.cancelMessages).toHaveBeenCalled();
            expect(scope.countryLabel).toEqual('somalia');
            expect(rootScope.countryLabel).toContain('somalia');
        });

        it('should save country name', function () {
            scope.countryLabel = 'uganda';
            scope.currentCountryLabel = 'somalia';
            rootScope.countryLabel = 'somalia';
            var formValid = true;
            deferUpdateSettings.resolve({'country_label': scope.countryLabel});
            spyOn(scope, 'saveMessages').and.callThrough(formValid);
            scope.saveMessages(formValid);
            scope.$apply();

            expect(mockSystemSettingsService.updateSettings).toHaveBeenCalled();
            expect(scope.saveMessages).toHaveBeenCalledWith(formValid);
            expect(scope.currentCountryLabel).toEqual('uganda');
            expect(rootScope.countryLabel).toContain('uganda');
            expect(mockToast.create).toHaveBeenCalled();
        });

        it('should not save country when form is invalid', function () {
            scope.countryLabel = 'uganda';
            scope.currentCountryLabel = 'somalia';
            rootScope.countryLabel = 'somalia';
            var formValid = false;
            spyOn(scope, 'saveMessages').and.callThrough(formValid);
            scope.saveMessages(formValid);
            scope.$apply();

            expect(scope.saveMessages).toHaveBeenCalledWith(formValid);
            expect(scope.currentCountryLabel).toBe('somalia');
            expect(rootScope.countryLabel).toContain('somalia');
            expect(mockToast.create).toHaveBeenCalled();
        });
    });
});
