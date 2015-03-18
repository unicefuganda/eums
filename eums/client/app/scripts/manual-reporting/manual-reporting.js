'use strict';

angular.module('ManualReporting', ['ngTable', 'siTable', 'NewDistributionPlan', 'eums.ip', 'PurchaseOrder', 'ReleaseOrder'])
    .controller('ManualReportingController', function ($sorter, $scope, $q, $location, PurchaseOrderService, ReleaseOrderService) {
        $scope.sortBy = $sorter;
        var purchaseOrders = [];
        var waybills = [];

        $scope.initialize = function () {
            angular.element('#loading').modal();

            this.sortBy('order_number');
            this.sort.descending = false;

            var documentPromises = [];

            documentPromises.push(
                PurchaseOrderService.getPurchaseOrders().then(function (responses) {
                    purchaseOrders = responses;
                })
            );

            documentPromises.push(
                ReleaseOrderService.getReleaseOrders().then(function (responses) {
                    responses.forEach(function (response) {
                        response.date = response.delivery_date;
                        response.order_number = response.waybill;
                    });
                    waybills = responses;
                })
            );

            $q.all(documentPromises).then( function(){
                $scope.toggleDocumentType('PO');
                angular.element('#loading').modal('hide');
            });
        };

        $scope.toggleDocumentType = function (type) {
            $scope.currentDocumentType = type;
            if (type === 'PO') {
                $scope.documents = purchaseOrders;
            }
            else {
                $scope.documents = waybills;
            }
        };

        $scope.sortArrowClass = function (criteria) {
            var output = '';
            if (this.sort.criteria === criteria) {
                output = 'active glyphicon glyphicon-arrow-down';
                if (this.sort.descending) {
                    output = 'active glyphicon glyphicon-arrow-up';
                }
            }
            return output;
        };

        $scope.selectDocument = function (document) {
           if($scope.currentDocumentType === 'PO'){
                $location.path('/field-verification-details/purchase-order/' + document.id);
            } else {
                $location.path('/field-verification-details/waybill/' + document.id);
            }
        };

        $scope.$watch('currentDocumentType', function(){
           $scope.placeHolderText = 'Search by purchase order number, date or programme';
           if($scope.currentDocumentType === 'WB'){
               $scope.placeHolderText = 'Search by waybill number, date or programme';
           }

        });
    })
    .filter('documentFilter', function ($filter) {
        return  function (documents, query) {
            var results = $filter('filter')(documents, {order_number: query});
            results = _.union(results, $filter('filter')(documents, {date: query}));
            results = _.union(results, $filter('filter')(documents, {programme: query}));
            return results;
        };
    });
