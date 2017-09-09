// public/js/appRoutes.js
    angular.module('appRoutes', []).config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

    $routeProvider
        // Main Front end page
        .when('/', {
            templateUrl: '../index.html',
            controller: 'MainController'
        })    
    $locationProvider.html5Mode(true);

}]);