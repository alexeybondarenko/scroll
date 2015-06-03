'use strict';

app.directive('infinityScroll', function ($log) {
    return {
        restrict: "E",
        require: ['^scroll','infinityScroll'],
        scope: {
            onInfinite: '&',
            distance: '@'
        },
        controller: function ($scope) {
            var _isLoading = false;
            this.infinityScroll = function () {
                if (_isLoading) return;
                console.log('infinityScroll', $scope.onInfinite());
                if ($scope.onInfinite) {
                    $scope.onInfinite();
                    _isLoading = true;
                }
            };
            this.finishInfinityScroll = function () {
                _isLoading = false;
            };
        },
        link: function (scope, el, attrs, ctrls) {
            var scrollCtrl = ctrls[0],
                infiniteCtrl = ctrls[1];
            el.addClass('infinity-scroll');
            scope.distance = scope.distance || 50;
            $log.debug('infinity scroll', scrollCtrl);
            scrollCtrl.$element.bind('scroll', function (e, data) {
                var bottom = scrollCtrl.scroll.scroller.__contentHeight - scrollCtrl.scroll.scroller.__clientHeight - data.top;
                if (bottom < scope.distance) {
                    infiniteCtrl.infinityScroll();
                }
            });
            scope.$on('$scrollDidFinishInfinity', function () {
                $log.debug('scrollDidFinishInfinity');
                infiniteCtrl.finishInfinityScroll();
            });
            scope.$on('$destroy', function () {
                $log.debug('infinity scroll destroy');
                scrollCtrl.$element.off('scroll');
            })
        }
    }
});