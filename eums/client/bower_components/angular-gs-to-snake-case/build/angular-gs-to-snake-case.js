// http://jamesroberts.name/blog/2010/02/22/string-functions-for-javascript-trim-to-camel-case-to-dashed-and-to-underscore/comment-page-1/

(function(window, angular, undefined) {'use strict';

angular.module('gs.to-snake-case', [])
.service('toSnakeCase', function () {
  function convert (str) {
    if (angular.isString(str)) {
      var newStr = str[0].toLowerCase() + str.slice(1);
      return newStr.replace(/([A-Z])/g, function($1){return '_'+$1.toLowerCase();});
    } else if (angular.isArray(str)) {
      var array = [];
      angular.forEach(str, function (i) {
        array.push(convert(i));
      });
      return array;
    } else {
      return null;
    }
  }

  return convert;
});

})(window, window.angular);
