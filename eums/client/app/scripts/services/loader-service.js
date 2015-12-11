angular.module('Loader', [])
    .service('LoaderService', function () {
        return {
            showLoader: function () {
                if (!angular.element('#loading').hasClass('in')) {
                    angular.element('#loading').modal();
                }
            },

            hideLoader: function () {
                angular.element('#loading').modal('hide');
                angular.element('#loading.modal').removeClass('in');
                angular.element('.modal-backdrop').remove();
            },

            showModal: function (id) {
                $('#' + id).modal({'backdrop':'static', 'keyboard': false});
            },

            hideModal: function (id) {
                $('#' + id).modal('hide');
            }
        }
    });
