'use strict';

angular.module('contacts', ['config'])
    .factory('ContactService', function ($http, URLs) {
        return {
            addContact: function (contact) {
                return $http.post(URLs.CONTACTSERVICEURL+'/add', contact);
            }
        };
    });