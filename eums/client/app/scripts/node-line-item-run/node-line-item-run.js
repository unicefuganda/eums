'use strict';

angular.module('NodeLineItemRun', ['eums.config', 'Item'])
    .factory('NodeLineItemRunService', function ($http, EumsConfig) {
        return {
            createNodeLineItemRun: function (nodeLineItemRunDetails) {
                return $http.post(EumsConfig.BACKEND_URLS.NODE_LINE_ITEM_RUN, nodeLineItemRunDetails).then(function (response) {
                    return response.data;
                });
            }
        };
    });


