'use strict';

angular.module('Consignee', ['eums.config', 'Contact'])
    .factory('ConsigneeService', function($http, EumsConfig, ContactService) {
        var fillOutContactPerson = function(consignee) {
            return ContactService.getContactById(consignee.contact_person_id).then(function(response) {
                delete consignee.contact_person_id;
                consignee.contactPerson = response.data;
                return consignee;
            });
        };

        return {
            getConsigneeDetails: function(consigneeId) {
                var getConsigneePromise = $http.get(EumsConfig.BACKEND_URLS.CONSIGNEE + consigneeId + '/');
                return getConsigneePromise.then(function(response) {
                    var consignee = response.data;
                    return fillOutContactPerson(consignee);
                });
            },
            createConsignee: function(consigneeDetails) {
                return $http.post(EumsConfig.BACKEND_URLS.CONSIGNEE, consigneeDetails).then(function(response) {
                    if(response.status === 201) {
                        return response.data;
                    }
                    else {
                        return response;
                    }
                });
            }
        };
    });


