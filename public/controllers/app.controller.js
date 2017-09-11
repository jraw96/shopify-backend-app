// Single page app controller

// Bind angular app with controller
var app = angular.module('MainCtrl', [])

app.controller('MainController', function($scope, $http) {

    // Front end manipulation variables.
    $scope.UItoggle = false
    $scope.showComma = true
    $scope.bullets = 0

    // Default API queury that appears on screen
    $scope.query = "https://backend-challenge-winter-2017.herokuapp.com/customers.json"

    // Get the invalid consumer list from the backends
    $scope.getConsumers = function(){
        $scope.fields = ""
        $scope.UItoggle = false
        $scope.showComma = true
        $scope.bullets = 0

        // Encorde url to send to backend: 
        var url = encodeURIComponent($scope.query)

        // Send call to backend
        $http.get('/api/data/' + url).then(function(response){

        // Reveal the list of consumers after recieving the backend response
        $scope.UItoggle = true
        $scope.fields = (response.data)

        // Set the total size of the invalid consumers
        $scope.size = response.data.length

         // Display a comma after every JSON object except the last
       $scope.increment = function(){
            response.data[$scope.bullets].showComma = true
            $scope.bullets++
            console.log("The bullets: " + $scope.bullets)
            if($scope.bullets === $scope.size){
                console.log("Setting to FALSE")
                response.data[$scope.bullets -1].showComma = false
            }
        }
       })
    }    
});