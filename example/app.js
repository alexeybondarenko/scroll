'use strict';

var app = angular.module('app', ['scroll']);
console.log('app.js');
app.controller('AppCtrl', function ($scope, $timeout) {
	$scope.refresh = function ()  {
		$timeout(function (){
			console.log('refresh finished');
			$scope.$broadcast('$scrollDidFinishLoading');
		}, 2000);
	};
	$scope.infinityEnabled = true;
	$scope.infinity = function () {
		console.log('load more');
		$timeout(function (){
			console.log('load more: :finished');
			$scope.$broadcast('$scrollDidFinishInfinity');
		}, 2000);
	}
});



