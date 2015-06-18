'use strict';

angular.module('ImportData', ['eums.config', 'angularFileUpload'])
    .controller('ImportDataController', function ($scope, FileUploader, EumsConfig) {

        //TODO: Refactor this functionality into a directive to avoid duplicate html in template
        function getUploader(apiUrl, errProp) {
            $scope[errProp] = undefined;
            var theUploader = new FileUploader({
                url: apiUrl
            });
            theUploader.onErrorItem = function () {
                $scope[errProp] = 'Failed to submit file to backend. Please ensure its not too big';
            };
            theUploader.onSuccessItem = function (item, response) {
                $scope[errProp] = response.error;
            };
            theUploader.onAfterAddingFile = function () {
                $scope[errProp] = undefined;
            };
            return theUploader;
        }

        $scope.salesOrdersUploader = getUploader(EumsConfig.BACKEND_URLS.IMPORT_SALES_ORDERS, 'errorMessageSO');
        $scope.releaseOrdersUploader = getUploader(EumsConfig.BACKEND_URLS.IMPORT_RELEASE_ORDERS, 'errorMessageRO');
        $scope.purchaseOrdersUploader = getUploader(EumsConfig.BACKEND_URLS.IMPORT_PURCHASE_ORDERS, 'errorMessagePO');
        $scope.consigneesUploader = getUploader(EumsConfig.BACKEND_URLS.IMPORT_CONSIGNEES, 'errorMessagePO');
        $scope.programmesUploader = getUploader(EumsConfig.BACKEND_URLS.IMPORT_PROGRAMMES, 'errorMessagePO');


    });