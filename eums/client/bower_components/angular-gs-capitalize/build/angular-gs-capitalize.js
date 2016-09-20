if (typeof module !== 'undefined' && typeof exports !== 'undefined' && module.exports === exports){
  module.exports = 'gs.capitalize';
}

(function(window, angular, undefined) {'use strict';

angular.module('gs.capitalize', [])
.factory('capitalize', [function () {
  return function (str) {
    return str[0].toUpperCase() + str.slice(1);
  };
}]);

})(window, window.angular);
