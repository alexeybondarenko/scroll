'use strict';

var app = angular.module('app', ['scroll']);
console.log('app.js');
app.run(function () {
    if(/Android 4\.[0-3]/.test(navigator.appVersion)){
        window.addEventListener("resize", function(){
            if(document.activeElement.tagName=="INPUT"){
                window.setTimeout(function(){
                    alert(123);
                    document.activeElement.scrollIntoViewIfNeeded();
                },0);
            }
        })
    }

    //if (/ipad|iphone/gi.test(window.navigator.userAgent)) {
    //    var events = "abort blur focus input scroll submit touchstart touchmove";
    //    $("form, input").on(events, function(e) {
    //        return ;
    //    }).focus();
    //};
});

app.controller('AppCtrl', function ($scope, $timeout) {
    $scope.alert = function (text) {
        console.log('alert');
        alert(text);
    };
    $scope.log = function (item) {
        console.log(item);
        alert(item);
    };
	$scope.refresh = function ()  {
        $scope.list = [];
        addItem(20);
		$timeout(function (){
			$scope.$broadcast('$scrollDidFinishLoading');
		}, 2000);
	};
	$scope.infinityEnabled = true;
	$scope.infinity = function () {
		console.log('load more');
        addItem(20);
		$timeout(function (){
			console.log('load more: :finished');
			$scope.$broadcast('$scrollDidFinishInfinity');
		}, 2000);
	};
    function addItem (count) {
        var i = count;
        var length = $scope.list.length,
            newLength = length + count;
        while (length++ < newLength) {
            $scope.list.push('New item ' + length);
        }
    }
    $scope.list = [];
    addItem(20);

});



