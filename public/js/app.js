(function()
{
	var app = angular.module('classpunch', [
		'ngRoute',
		'appControllers',
		'ngAnimate'
	]);
	app.config(['$routeProvider',
		function($routeProvider)
		{
			$routeProvider.
				when('/matrix', {
					templateUrl: 'partials/matrix.html',
					controller: 'MatrixController'
				}).
				when('/canvas', {
					templateUrl: 'partials/canvas.html',
					controller: 'CanvasController'
				}).
				otherwise({
					redirectTo: '/matrix'
				});
		}
	]);
})();