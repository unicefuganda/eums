'use strict';

angular.module('ImportData', ['eums.config', 'angularFileUpload'])
    .controller('ImportDataController', function ($scope, FileUploader, EumsConfig) {
        $scope.salesOrdersUploader = new FileUploader({
            url: EumsConfig.BACKEND_URLS.IMPORT_SALES_ORDERS
        });

        $scope.releaseOrdersUploader = new FileUploader({
            url: EumsConfig.BACKEND_URLS.IMPORT_RELEASE_ORDERS
        });

        $scope.purchaseOrdersUploader = new FileUploader({
            url: EumsConfig.BACKEND_URLS.IMPORT_PURCHASE_ORDERS
        });
    });