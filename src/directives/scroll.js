'use strict';

app.directive('scroll', function ($log, $controller) {
    return {
        restrict: 'E',
        scope: {
            'onRefresh': '&'
        },
        controller: '$scroll',
        compile: function (el, attrs) {
            el.addClass('scroll');
            var scrollWrap = angular.element('<div/>').addClass('scroll-wrap');
            scrollWrap.append(el.contents());
            el.append(scrollWrap);

            function prelink($scope, el, attrs, ctrl) {
                ctrl.setScroll(scrollWrap[0], {
                    scrollable: attrs['scrollable'],
                    zommable: attrs['zoomable']
                });
            }

            return {pre: prelink};
        }
    }
});