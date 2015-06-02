'use strict';

app.directive('infinityScroll', function ($log) {
    return {
        restrict: "E",
        require: ['^scroll','infinityScroll'],
        replace: true,
        template: '<div class="infinity-scroll">loading</div>',
        scope: {
            onInfinite: '&'
        },
        controller: function ($scope) {
            var _isLoading = false;
            this.infinityScroll = function () {
                if (_isLoading) return;
                console.log('infinityScroll', $scope.onInfinite());
                if ($scope.onInfinite()) {
                    $scope.onInfinite()();
                    _isLoading = true;
                }
            };
            this.finishInfinityScroll = function () {
                _isLoading = false;
            };
        },
        link: function (scope, el, attrs, ctrls) {
            console.log(ctrls);
            var scrollCtrl = ctrls[0],
                infiniteCtrl = ctrls[1];
            var config = {
                start: 50 // start from 50px from bottom
            };
            $log.debug('infinity scroll', scrollCtrl);
            scrollCtrl.$element.bind('scroll', function (e, data) {
                var bottom = scrollCtrl.scroll.scroller.__contentHeight - scrollCtrl.scroll.scroller.__clientHeight - data.top;
                $log.debug('infinity scroll', bottom, config.start);
                if (bottom < config.start) {
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