'use strict';

app.controller('$scroll', function ($scope) {
    this.scroll = null;
    this._finishRefresh = function () {
        this.scroll.refresher.className = this.scroll.refresher.className.replace(" " + this.scroll.refreshConfig.runningClass, "");
        this.scroll.scroller.finishPullToRefresh();
    };
    this.setRefresher = function (refreshElem, scope, config) {

        refreshElem = angular.element(refreshElem);
        refreshElem = refreshElem[0];
        this.scroll.refresher = refreshElem;
        config = config || {
            activeClass: 'active',
            runningClass: 'running'
        };

        this.scroll.refreshConfig = config;

        if (this.scroll) {
            this.scroll.scroller.activatePullToRefresh(refreshElem.offsetHeight, function () {
                refreshElem.className += " " + config.activeClass;
                refreshElem.innerHTML = scope.pullText;
            }, function () {
                refreshElem.className = refreshElem.className.replace(" " + config.activeClass, "");
                refreshElem.innerHTML = scope.releaseText;
            }, function () {
                refreshElem.className += " " + config.runningClass;
                refreshElem.innerHTML = scope.refreshText;
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