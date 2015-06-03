'use strict';

app.directive('refresher', function ($log) {
    return {
        restrict: 'E',
        require: ['^scroll'],
        replace: false,
        template: '<div class="refresh"><i class="icon" ng-class="icon"></i>{{text}}</div>',
        scope: {
            pullText: '@',
            releaseText: '@',
            refreshText: '@'
        },
        link: function ($scope, el, attrs, ctrls) {
            var scrollCtrl = ctrls[0];
            $scope.pullText = $scope.pullText || 'Pull new to refresh...';
            $scope.pullIcon = $scope.pullIcon || 'icon-arrow-down';

            $scope.releaseText = $scope.releaseText || 'Release to refresh...';
            $scope.releaseIcon = $scope.releaseIcon || 'icon-arrow-up';

            $scope.refreshText = $scope.refreshText || 'Loading...';
            $scope.refreshIcon = $scope.refreshIcon || 'icon-spinner';

            $scope.text = $scope.pullText;
            $scope.icon = $scope.pullIcon;

            $log.debug('refresher directive:: scroll ctrl', ctrls, scrollCtrl.scroll);

            scrollCtrl.setRefresher(angular.element(el[0].querySelector('.refresh')), $scope);
            $scope.$on('$scrollDidFinishLoading', function () {
                $scope.text = $scope.pullText;
                $scope.icon = $scope.pullIcon;
                scrollCtrl._finishRefresh();
            });
        }
    };
});