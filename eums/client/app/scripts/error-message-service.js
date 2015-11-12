angular.module('EumsErrorMessage', ['ngToast'])
    .service('ErrorMessageService', function (ngToast) {
        return {
            showError: function (errorMessage) {
                errorMessage = errorMessage ? errorMessage : 'An error occurred. Please refresh and try again.';
                ngToast.create({content: errorMessage, class: 'danger'});
            }
        }
    });