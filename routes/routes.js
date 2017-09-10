// Backend Routes
var request = require('request');

// Dirty global variable
var shame = []
var index = 1
var pagesCompleted = 0
var totalPagesNeeded = 0
var pumpkin = {}
var cheat = {}
var onetime = true
var queryPageIndex = 0

module.exports = function(app) {

    app.get('/api/data/:url', function(req, res) {

        console.log("tacos")
   
        var query= JSON.stringify(req.query.url)
        console.log("The url is: " + query)

        console.log("CRAZY: " + req.params.url)

    // Reset global variables everytime the function is called
    shame = []
    index = 1
    pagesCompleted = 0
    totalPagesNeeded = 0
    onetime = true
    
      // Callback function that will return all invalid customers to the UI (front end)
      validateConsumers(req.params.url, false, res)
    
    })

    // Handle all angular api requests
    app.get('*', function(req, res) {
        res.sendfile('./public/views/index.html'); // load our public/index.html file
    })


    // Local functions =============================================
    //
    // Validate every consumer according to the attached validation standards
    function validateConsumers(query, previousObj, callback){
        console.log("yo dawgs")
        //Check if the first query recieved was from a non-first page API query
       
        if(onetime){
        queryPageIndex = (query[query.length - 1])
        console.log("INSIDE ONE TIME: " + query)     
        console.log("INSIDE ONE TIME: " + queryPageIndex)
        onetime = false
        if(( !isNaN(queryPageIndex))){
                queryPageIndex=parseInt(queryPageIndex)
                index = queryPageIndex
                console.log("ONE TIME????????????: " + index)
            }else{
                queryPageIndex = 1
            }
        }


              request(query, function (error, response, body) {

                //console.log("The previousObj" + JSON.stringify(previousObj))
                  if (!error && response.statusCode == 200) {
                    //console.log(JSON.parse(body).validations) //  Print the successful body
                    //console.log(JSON.parse(body).customers) //  Print the successful body
                    
                  }
      
                // Figure out how many total API calls are needed to validate every consumer
                totalPages = JSON.parse(body).pagination.total
                var totalAPIpages = Math.ceil(totalPages / 5)
                totalPagesNeeded = totalAPIpages
      
      
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
                      if(customerList[i].name){
      
                          
                          // If both fields for name sizes are included
                          if(nameMin && nameMax){
                              if(customerList[i].name.length < nameMin || customerList[i].name.length > nameMax){
                                  invalidFields.name = true
                                 // console.log("banana1")
                              }
                          }
      
                          // If only the min field is included
                          else if(nameMin && !nameMax){
                              if(customerList[i].name.length < nameMin){
                                  invalidFields.name = true
                                 // console.log("banana2")
                              }
                          }
      
                          // If only the max field is provided
                          else if(!nameMin && nameMax){
                              if(customerList[i].name.length > nameMax){
                                  invalidFields.name = true
                                 // console.log("banana3")
                              }
                          }
      
                      }else{
                          invalidFields.name = true
                         // console.log("banana4")
                      }
      
                      // Checking namefield type
                      if((typeof customerList[i].name).localeCompare("string") !== 0){
                          invalidFields.name = true
                         // console.log("banana5: " + typeof customerList[i])
                      }
      
                      // Checking email field =============================================
                      if((typeof customerList[i].email).localeCompare("string") !== 0){
                        invalidFields.email = true
                        //console.log("banana6: " + typeof customerList[i])
                    }
      
                      // Checking age field ===============================================
                      if(customerList[i].age){

                          if((typeof customerList[i].age).localeCompare("number") !== 0){
                              invalidFields.age = true
                          }
                      }else{
                          invalidFields.age = true
                        //  console.log("Invalid age@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@: " + JSON.stringify(customerList[i]))
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



                  responseObj.totalPages = totalAPIpages

               
                    for(var i = 0; i <= responseObj.invalid_customers.length - 1; i++){
                        if(previousObj){
                            previousObj.invalid_customers.push(responseObj.invalid_customers[i])
                        }
                        shame.push(responseObj.invalid_customers[i])
                    }
                  
                 
                  //console.log("The previousObj: " + JSON.stringify(previousObj))
                 // console.log("The curretn index: " + index)
                    pagesCompleted++
                 //   console.log("Pages completed: " + pagesCompleted)
                  // Check if every page has been looked at:
                //  console.log("The current page: " + JSON.parse(body).pagination.current_page)

                console.log("TotalpagesNeeded: " + totalPagesNeeded)
                console.log("query page index: " + queryPageIndex)
                 console.log("Comparing: " + pagesCompleted + " and " + (totalPagesNeeded - (queryPageIndex -1)) )
                if(pagesCompleted ===(totalPagesNeeded - (queryPageIndex -1))){
                    console.log("The final shame: " + JSON.stringify(shame))
                   // res.send(shame)
                    callback.send(shame)
                    
                    //return shame
                }



                // Make more API calls if there are more than one page
                if(((typeof previousObj).localeCompare("boolean") === 0) && (responseObj.totalPages > 1)){
                    
                       
                       
                        // Create a mini-scope for each async request using an object loop. Convert the pages into an array of objects
                        var scopeArray = []
                        for(var i = 0; i <= responseObj.totalPages - (1 + queryPageIndex); i++){
                            scopeArray.push(JSON.stringify(i))
                        }

                        console.log("SIZE OF SCOPE ARRAY ----------- " + scopeArray.length)

                       // var tempArray = []

                        scopeArray.forEach(function(scope) {
                            //console.log("The SCOPRE: " + scope)
                            // Make recursive calls to the validateConsumers function
                            index++
                            console.log("THE INDEX BEFORE CALL **************************: " + index)

                            var query = 'https://backend-challenge-winter-2017.herokuapp.com/customers.json?page=' + index
                            console.log()
                            responseObj = validateConsumers(query, responseObj, callback)       
                                    
                        })

                     
                             
                }else{
                    
                  //console.log("PANCAKES!!!!!!!!!!!!!!!!!!!!!!!!!!!! : " + JSON.stringify(previousObj))
                    // Only returned through recursion
                    //return previousObj
                }

        }) // End of function
    }
}