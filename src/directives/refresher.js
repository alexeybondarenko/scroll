'use strict';

app.directive('refresher', function ($log) {
    return {
        restrict: 'E',
        require: ['^scroll'],
        replace: false,
        template: '<div class="refresh"></div>',
        scope: {
            pullText: '=',
            releaseText: '=',
            refreshText: '='
        },
        link: function ($scope, el, attrs, ctrls) {
            var scrollCtrl = ctrls[0];
            $scope.pullText = $scope.pullText || 'Pull to refresh...';
            $scope.releaseText = $scope.releaseText || 'Release to refresh...';
            $scope.refreshText = $scope.refreshText || 'Loading...';
            $log.debug('refresher directive:: scroll ctrl', ctrls, scrollCtrl.scroll);

            scrollCtrl.setRefresher(angular.element(el[0].querySelector('.refresh')), $scope);
            $scope.$on('$scrollDidFinishLoading', function () {
                scrollCtrl._finishRefresh();
            });
        }
    };
});