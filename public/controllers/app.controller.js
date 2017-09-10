// Single page app controller

var app = angular.module('MainCtrl', [])

app.controller('MainController', function($scope, $http) {
    $scope.tagline = "your boy Edmond Dantes";
    $scope.fields = ""

    $scope.getConsumers = function(){
       $http.get('/api/data').then(function(response){

        console.log(JSON.stringify(response))
        $scope.fields = (response.data)




       })
    }


    $scope.test = function(){
        console.log("Functions are working")
    }

});