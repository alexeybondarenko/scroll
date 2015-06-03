'use strict';

app.controller('$scroll', function ($scope, $log, $timeout) {
    this.scroll = null;
    this._finishRefresh = function () {
        this.scroll.refresher.removeClass(this.scroll.refreshConfig.runningClass);
        this.scroll.refresher.removeClass(this.scroll.refreshConfig.activeClass);

        this.scroll.scroller.finishPullToRefresh();
    };
    this.setRefresher = function (refreshElem, scope, config) {

        this.scroll.refresher = angular.element(refreshElem);
        var height = refreshElem[0].offsetHeight;

        config = config || {
            activeClass: 'active',
            runningClass: 'running'
        };

        this.scroll.refreshConfig = config;

        if (this.scroll) {
            var self = this;
            this.scroll.scroller.activatePullToRefresh(height, function () {
                self.scroll.refresher.addClass(config.activeClass);
                $log.debug('refresher:: release');
                $timeout(function () {
                    scope.text = scope.releaseText;
                    scope.icon = scope.releaseIcon;
                });
            }, function () {
                self.scroll.refresher.removeClass(config.activeClass);
                $log.debug('refresher:: pull');
                $timeout(function () {
                    scope.text = scope.pullText;
                    scope.icon = scope.pullIcon;
                });
            }, function () {
                self.scroll.refresher.addClass(config.runningClass);
                $log.debug('refresher:: refresh');
                $timeout(function () {
                    scope.text = scope.refreshText;
                    scope.icon = scope.refreshIcon;
                });

                if ($scope.onRefresh) $scope.onRefresh()
            });
        }
    };
    this.setScroll = function (element, options) {
        var scrollable = options.scrollable || 'y';
        var zoomable = options.zoomable || '';
        var zoomOptions = zoomable.split('-');
        var minZoom = zoomOptions.length > 1 && parseFloat(zoomOptions[0]);
        var maxZoom = zoomOptions.length > 1 && parseFloat(zoomOptions[1]);
        var scrollEventDelay = 300;

        this.$element = angular.element(element);
        var that = this;
        var onScroll = Utils.throttle(function (data) {
            that.$element.triggerHandler('scroll', data);
        }, scrollEventDelay);
        this.scroll = new EasyScroller(element, {
            scrollingX: scrollable === 'true' || scrollable === 'x',
            scrollingY: scrollable === 'true' || scrollable === 'y',
            zooming: zoomable === 'true' || zoomOptions.length > 1,
            minZoom: minZoom,
            maxZoom: maxZoom,
            onScroll: onScroll
        });
    };
});