angular.module('siTable.directives').config(['$provide', function ($provide) {
    $provide.decorator('sortByDirective', function ($delegate) {
        var dir = $delegate[0];

        dir.template = '\
           <th class="sort" ng-click="sort()" ng-class="{\
             \'sort-desc\': state === \'desc\',\
             \'sort-asc\': state === \'asc\'\
           }">\
           <a href ng-transclude></a>\
           <span class="sort-caret sort-desc"\
           ng-if="state === \'desc\'"><i class="eums-sort-arrow glyphicon glyphicon-arrow-down"></i></span>\
           <span class="sort-caret sort-asc"\
           ng-if="state === \'asc\'"><i class="eums-sort-arrow glyphicon glyphicon-arrow-up"></i></span>\
           </th>';

        return $delegate;
    })
}]);
