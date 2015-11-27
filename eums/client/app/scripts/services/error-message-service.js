angular.module('EumsErrorMessage', ['ngToast'])
    .service('ErrorMessageService', function (ngToast) {
        return {
            showError: function (errorMessage) {
                errorMessage = errorMessage ? errorMessage : 'Lost connection. Please refresh and try again.';
                ngToast.create({content: errorMessage, class: 'danger'});
            }
        }
    });