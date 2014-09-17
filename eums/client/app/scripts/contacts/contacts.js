'use strict';

angular.module('contacts', ['config'])
    .factory('ContactService', function ($http, URLs) {
        return {
            addContact: function (contact) {
                return $http.post(URLs.CONTACTSERVICEURL, contact);
            }
        };
    })
    .controller('AddContactController', function($scope,ContactService, $location){
        $scope.contact = {};
        $scope.addContact = function(){
            ContactService.addContact($scope.contact).then(function(){
                $location.path('/');
            }, function(){
                $scope.errorMessage = 'Contact not saved';
            });
        };
    });