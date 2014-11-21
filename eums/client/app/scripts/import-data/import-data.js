'use strict';

angular.module('ImportData', ['eums.config', 'angularFileUpload'])
    .controller('ImportDataController', function ($scope, ImportDataService, FileUploader, EumsConfig) {
        $scope.uploader = new FileUploader({
            url: EumsConfig.BACKEND_URLS.IMPORT_SALES_ORDERS
        });
    })
    .factory('ImportDataService', function ($http) {
        return {
            uploadFileToUrl: function (file, uploadUrl) {
                var fd = new FormData();
                fd.append('file', file);
                $http.post(uploadUrl, fd, {
                    transformRequest: angular.identity,
                    headers: {'Content-Type': undefined}
                })
                    .success(function () {
                    })
                    .error(function () {
                    });
            }
        };
    });