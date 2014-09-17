'use strict';

angular.module('config', [])
    .factory('URLs', function () {
        return{
            CONTACTSERVICEURL: 'http://localhost:8005/api/contacts'
        };
    });