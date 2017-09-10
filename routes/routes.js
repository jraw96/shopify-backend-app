// Backend Routes
var request = require('request');


module.exports = function(app) {

    // Get data from the Shopify API end point
    app.get('/api/data', function(req, res) {

        var totalAPIpages = 1
        var queryExtension = ""
        var jsonPageNum = 0

        // Make an API call for each page of JSON information. Assume there is one page to start, then modify depending
        // on the data from the first page.
       for(var j = 0; j <= totalAPIpages - 1; j++){
      
       var requestURL = 'https://backend-challenge-winter-2017.herokuapp.com/customers.json' + queryExtension
       console.log("THIS WTFFFFF: " + requestURL)
        request(requestURL, function (error, response, body) {
            if (!error && response.statusCode == 200) {
              console.log(JSON.parse(body).validations) //  Print the successful body
              console.log(JSON.parse(body).customers) //  Print the successful body
            }

            totalPages = JSON.parse(body).pagination.total
            console.log("The total pages from request: " + totalPages)
            // Calculate how many API calls will need to be made to see every customer. 
            // This is calculate from data on the first API call
            console.log("The value of j: " + j)
            if(j === 1){
                
                var totalAPIpages = Math.ceil(totalPages / 5)
                           
            }

            console.log("TOTAL PAGES FOR API CALL!!!!!!!!!!!!!!!!!!: " + totalAPIpages)



            // Invalid response object array. Will get optionally populated depending on invalid clients
            var responseObj = {
                "invalid_customers":[]
            }

            // Get key fields from the response body
            var customerList = JSON.parse(body).customers
            try{
                var nameMin = JSON.parse(body).validations[0].name["length"].min
            }catch(err){
                var nameMin = false
            }

            try{
                var nameMax = JSON.parse(body).validations[0].name["length"].max
            }catch(err){
                var nameMax = false
            }

            // Parse every customer inside the JSON array for the field validation
            for(var i = 0; i <= customerList.length - 1; i++){
                var customer = {}
                var invalidFields = {}

                // Checking "name" field =================================================
                //
                //Check name field Length 
                console.log("The first name: " + customerList[i].name)
                console.log("bools: " + nameMin + nameMax)
                if(customerList[i].name){

                    
                    // If both fields for name sizes are included
                    if(nameMin && nameMax){
                        if(customerList[i].name.length < nameMin || customerList[i].name.length > nameMax){
                            invalidFields.name = true
                            console.log("banana1")
                        }
                    }

                    // If only the min field is included
                    else if(nameMin && !nameMax){
                        console.log("Checking with min: " + nameMin + " on: " + customerList[i].name)
                        if(customerList[i].name.length < nameMin){
                            invalidFields.name = true
                            console.log("banana2")
                        }
                    }

                    // If only the max field is provided
                    else if(!nameMin && nameMax){
                        if(customerList[i].name.length > nameMax){
                            invalidFields.name = true
                            console.log("banana3")
                        }
                    }

                }else{
                    invalidFields.name = true
                    console.log("banana4")
                }

                // Checking namefield type
                if((typeof customerList[i].name).localeCompare("string") !== 0){
                    invalidFields.name = true
                    console.log("banana5: " + typeof customerList[i])
                }

                // Checking email field =============================================
                if(!customerList[i].email){
                    invalidFields.email = true
                }

                // Checking age field ===============================================
                if(customerList[i].age){
                    console.log("-----------Testing this: " + typeof customerList[i].age)
                    if((typeof customerList[i].age).localeCompare("number") !== 0){
                        invalidFields.age = true
                    }
                }else{
                    console.log("BEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEP")
                    invalidFields.age = true
                }

                // Checking news letter fields =====================================
                if((typeof customerList[i].newsletter).localeCompare("undefined") !== 0){
                    if((typeof customerList[i].newsletter).localeCompare("boolean") !== 0){
                        invalidFields.newsletter = true
                    }
                }else{
                    invalidFields.newsletter = true
                }


                // Check if any of the fields are detected as invalid. IF there are, build an invalid respond object              
                // Invalid field parameters
                var invalid_fields = []
                var id = ""

                if(invalidFields.name){
                    invalid_fields.push("name")
                    id = customerList[i].id
                }
                
                if(invalidFields.email){
                    invalid_fields.push("email")
                    id = customerList[i].id
                }

                if(invalidFields.age){
                    invalid_fields.push("age")
                    id = customerList[i].id
                }

                if(invalidFields.newsletter){
                    invalid_fields.push("newsletter")
                    id = customerList[i].id
                }

                // Push to the invalid objects array if there were any invalid fields
                if(id){
                    var temp = {}
                    temp.id = id
                    temp.invalid_fields = invalid_fields
                    responseObj.invalid_customers.push(temp)
                }      
            }

            console.log("The final obejct: " + JSON.stringify(responseObj))

            // Send the results of the field validation back to the front end
            res.send(responseObj)
          })
    }})

    // Handle all angular api requests
    app.get('*', function(req, res) {
        res.sendfile('./public/views/index.html'); // load our public/index.html file
    })
}