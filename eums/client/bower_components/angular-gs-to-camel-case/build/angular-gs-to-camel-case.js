if (typeof module !== 'undefined' && typeof exports !== 'undefined' && module.exports === exports){
  module.exports = 'gs.to-camel-case';
}

(function(window, angular, undefined) {'use strict';

angular.module('gs.to-camel-case', ['gs.capitalize'])
.factory('toCamelCase', ['capitalize',
function (capitalize) {
  var capMap, toCamelCase;

  function hasUnderscores (str) {
    return str.match('_');
  }

  function join (strs) {
    return strs.join('');
  }

  function split (str) {
    var splitStrings = str.split('_');
    _.remove(splitStrings, function(x) { return !x; });
    return splitStrings;
  }

  function lowerCase (str) {
    return str[0].toLowerCase() + str.slice(1);
  }

  capMap = _.partialRight(_.map, capitalize);
  toCamelCase = _.compose(lowerCase, join, capMap, split);

  return function (str) {
    return hasUnderscores(str) ? toCamelCase(str) : str;
  };
}]);

})(window, window.angular);
