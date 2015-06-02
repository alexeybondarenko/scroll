'use strict';

var app = angular.module('app', ['scroll']);
console.log('app.js');
app.controller('AppCtrl', function ($scope, $timeout) {
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



