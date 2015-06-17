'use strict';

angular.module('ImportData', ['eums.config', 'angularFileUpload'])
    .controller('ImportDataController', function ($scope, FileUploader, EumsConfig) {
        $scope.errorMessage = '';
        $scope.salesOrdersUploader = new FileUploader({
            url: EumsConfig.BACKEND_URLS.IMPORT_SALES_ORDERS
        });

        $scope.salesOrdersUploader.onErrorItem = function(){
            $scope.errorMessage = 'Failed to submit file to backend. Please ensure its not too big';
        };
        $scope.salesOrdersUploader.onSuccessItem = function(item, response){
            $scope.errorMessage = response.error;
        };
        $scope.releaseOrdersUploader = new FileUploader({
            url: EumsConfig.BACKEND_URLS.IMPORT_RELEASE_ORDERS
        });
        $scope.releaseOrdersUploader.onErrorItem = function(){
            $scope.errorMessage = 'Failed to submit file to backend. Please ensure its not too big';
        };
        $scope.releaseOrdersUploader.onSuccessItem = function(response){
            $scope.errorMessage = response.error;
        };

        $scope.purchaseOrdersUploader = new FileUploader({
            url: EumsConfig.BACKEND_URLS.IMPORT_PURCHASE_ORDERS
        });
        $scope.purchaseOrdersUploader.onErrorItem = function(){
            $scope.errorMessage = 'Failed to submit file to backend. Please ensure its not too big';
        };
        $scope.purchaseOrdersUploader.onSuccessItem = function(item, response){
            $scope.errorMessage = response.error;
        };

    });