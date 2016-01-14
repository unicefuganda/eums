'use strict';

angular.module('FileUploadService', ['eums.config'])
    .factory('FileUploadService', function ($http, $q, EumsConfig) {
        return {
            getImages: function (plan_id) {
                var result = $q.defer(),
                    param = plan_id ? '?plan=' + plan_id : '';
                $http.get(EumsConfig.BACKEND_URLS.UPLOAD_IMAGE + param).then(function (response) {
                    result.resolve(response.data);
                }, function () {
                    result.reject();
                });
                return result.promise;
            }
        }
    });
