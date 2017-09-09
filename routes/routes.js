// Backend Routes
var request = require('request');


module.exports = function(app) {

    // Get data from the Shopify API end point
    app.get('/api/data', function(req, res) {


        request('https://backend-challenge-winter-2017.herokuapp.com/customers.json', function (error, response, body) {
            if (!error && response.statusCode == 200) {
              console.log(body) //  Print the successful body
            }

            // Validation Fields ===============

            // Name
            var validations = body.validations
            var nameReq = false
            var nameType = "string"
            var nameLength = 0

            // Email
            var emailReq = false

            // Age
            var ageType = "number"
            var ageReq = "false"

            // Newsletter
            var newsReq = false
            var newType = "boolean"


            
            





            res.send(body)
          })
    })

    // Handle all angular api requests
    app.get('*', function(req, res) {
        res.sendfile('./public/views/index.html'); // load our public/index.html file
    })
}