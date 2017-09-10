// Single page app controller

var app = angular.module('MainCtrl', [])

app.controller('MainController', function($scope, $http) {
    $scope.tagline = "your boy Edmond Dantes";

    $scope.UItoggle = false
    $scope.showComma = true
    $scope.bullets = 0

    $scope.query = "https://backend-challenge-winter-2017.herokuapp.com/customers.json"

    // Get the invalid consumer list from the backends
    $scope.getConsumers = function(){
        $scope.fields = ""
        $scope.UItoggle = false
        $scope.showComma = true
        $scope.bullets = 0



        // Encorde url to send to backend: 
        var url = encodeURIComponent($scope.query)
        let params = new URLSearchParams; //Send the account ID as a paramter in the get request
        params.set('param1',url);

        console.log("Sending this: " + url)
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