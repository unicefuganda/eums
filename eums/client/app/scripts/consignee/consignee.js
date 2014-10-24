'use strict';

angular.module('Consignee', ['eums.config', 'Contact'])
    .factory('ConsigneeService', function ($http, EumsConfig) {
                 return {
                     fetchConsignees: function() {
                          return $http.get(EumsConfig.BACKEND_URLS.CONSIGNEE).then(function (response) {
                              return response.data;
                          });
                     },
                     getConsigneeById: function (consigneeId) {
                         return $http.get(EumsConfig.BACKEND_URLS.CONSIGNEE + consigneeId + '/').then(function (response) {
                             return { id: response.data.id, name: response.data.name};
                         });
                     },
                     createConsignee: function (consigneeDetails) {
                         return $http.post(EumsConfig.BACKEND_URLS.CONSIGNEE, consigneeDetails).then(function (response) {
                             if (response.status === 201) {
                                 return response.data;
                             }
                             else {
                                 return response;
                             }
                         });
                     }
                 };
             });


