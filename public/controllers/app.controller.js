// Single page app controller

var app = angular.module('MainCtrl', [])

app.controller('MainController', function($scope, $http) {
    $scope.tagline = "your boy Edmond Dantes";
    $scope.fields = ""

    $scope.getConsumers = function(){
       $http.get('/api/data').then(function(response){

        console.log(JSON.stringify(response.data))
        $scope.fields = JSON.stringify(response.data.customers)




       })
    }


    $scope.test = function(){
        console.log("Functions are working")
    }

});