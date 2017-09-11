// Backend Routes
var request = require('request');

// Global scope route variables
var invalidCusomterObject = []  // Contains the object of all invalid customers. Gets updated for every new API call 
var index = 1                   // Counter variable for querying the API endpoint page extension
var pagesCompleted = 0          // Counter variable for each successful API call
var totalPagesNeeded = 0        // Comparison variable for for when the 'pagesCompleted' variable reaches a match
var onetime = true              // A boolean toggle variable to distinguish a single API call or many API calls. 
var queryPageIndex = 0          // A tracker variable for recording which page the API endpoint is on

module.exports = function(app) {

    // Route for front end calls containing API routes
    app.get('/api/data/:url', function(req, res) {

    // Reset global variables everytime the function is called
    invalidCusomterObject = []
    index = 1
    pagesCompleted = 0
    totalPagesNeeded = 0
    onetime = true

    // Extract the query from the query parameters
    var query= JSON.stringify(req.query.url)
    
    // Callback function that will return all invalid customers to the UI (front end)
    // Contains the expression 'res.send()'
    validateConsumers(req.params.url, false, res)
    })

    // Hand the home page route
    app.get('*', function(req, res) {
        res.sendfile('./public/views/index.html'); 
    })


    // Local functions =============================================
    //
    // Validate every consumer according to the attached validation standards
    function validateConsumers(query, previousObj, callback){
       
        // There is a special condition for the first API call of a series. 
        // It will set paramters for the procedding API calls
        if(onetime){
        queryPageIndex = (query[query.length - 1])
        onetime = false
        if(( !isNaN(queryPageIndex))){
                queryPageIndex=parseInt(queryPageIndex)
                index = queryPageIndex
            }else{
                queryPageIndex = 1
            }
        }

              // Use the node package 'request' to call the API endpoint
              request(query, function (error, response, body) {

                // Check the status of the API call
                  if (!error && response.statusCode == 200) {
                    console.log("Successful connection to API endpoint")
                  }
      
                // Figure out how many total API calls are needed to validate every consumer
                totalPages = JSON.parse(body).pagination.total
                var totalAPIpages = Math.ceil(totalPages / 5)
                totalPagesNeeded = totalAPIpages
      
      
                  // Invalid response object array. Will get optionally populated depending on amount of invalid clients
                  var responseObj = {
                      "invalid_customers":[]
                  }
      
                  // Extract the min and max values for the length of the names. This is purely for ease of use for further on.
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
      
                  // Parse every customer inside the JSON array for the field validation for every given property.
                  for(var i = 0; i <= customerList.length - 1; i++){
                      var customer = {}
                      var invalidFields = {}
      
                      // Checking "name" field =================================================
                      //
                      //Check name field Length 
                      if(customerList[i].name){
      
                          
                          // If both fields for name sizes are included
                          if(nameMin && nameMax){
                              if(customerList[i].name.length < nameMin || customerList[i].name.length > nameMax){
                                  invalidFields.name = true
                              }
                          }
      
                          // If only the min field is included
                          else if(nameMin && !nameMax){
                              if(customerList[i].name.length < nameMin){
                                  invalidFields.name = true
                              }
                          }
      
                          // If only the max field is provided
                          else if(!nameMin && nameMax){
                              if(customerList[i].name.length > nameMax){
                                  invalidFields.name = true
                              }
                          }    
                      }else{
                          invalidFields.name = true
                      }
      
                      // Checking namefield type
                      if((typeof customerList[i].name).localeCompare("string") !== 0){
                          invalidFields.name = true
                      }
      
                      // Checking email field =============================================
                      if((typeof customerList[i].email).localeCompare("string") !== 0){
                        invalidFields.email = true
                    }
      
                      // Checking age field ===============================================
                      if(customerList[i].age){

                          if((typeof customerList[i].age).localeCompare("number") !== 0){
                              invalidFields.age = true
                          }
                      }else{
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
      
      
                      // Check if any of the fields are detected as invalid. IF there are, build an invalid response object              
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


                // Add a property to the final object, with the amount of total pages. 
                responseObj.totalPages = totalAPIpages

               
                // For re-occuring API call, process the objects of invalid customers accordingly to properly merge and not lose data
                for(var i = 0; i <= responseObj.invalid_customers.length - 1; i++){
                    if(previousObj){
                        previousObj.invalid_customers.push(responseObj.invalid_customers[i])
                    }
                    invalidCusomterObject.push(responseObj.invalid_customers[i])
                }
                
                // Increment the total pages completed by this line in the synchronous code block
                pagesCompleted++

                // Send the finished Invalid Customers object back to the Front End if the completed pages reached the target amount of pages
                if(pagesCompleted ===(totalPagesNeeded - (queryPageIndex -1))){
                    callback.send(invalidCusomterObject)
                }



                // If there are more pages avaible for querying, make a recursive, asynchronous call to the validateConsumers function
                if(((typeof previousObj).localeCompare("boolean") === 0) && (responseObj.totalPages > 1)){

                        // Create a mini-scope for each async request using an object loop. 
                        // Below is an array of numbers, just to populate a forEach() loop
                        var scopeArray = []
                        for(var i = 0; i <= responseObj.totalPages - (1 + queryPageIndex); i++){
                            scopeArray.push(JSON.stringify(i))
                        }

                        // Make the api calls for all pages after the originally recieved API point, if they exist. 
                        scopeArray.forEach(function(scope) {
                            index++
                            var query = 'https://backend-challenge-winter-2017.herokuapp.com/customers.json?page=' + index
                            responseObj = validateConsumers(query, responseObj, callback)                                  
                        })         
                }
        }) // End of function validateConsumers
    }
}

// Thank you for reading :D