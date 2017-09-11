// server.js =============================================

// Importing dependencies
var express        = require('express')
var app            = express()
var bodyParser     = require('body-parser')
var methodOverride = require('method-override')

// Setting ports
var port = process.env.PORT || 8080

// For reading json in POST paramterss
app.use(bodyParser.json())

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))


// Tell the backend where the front end is
app.use(express.static(__dirname + '/public')); 

// routes ==================================================
require('./routes/routes.js')(app);


app.listen(port);  
console.log("Running on port" + port)

// Expost App
module.exports = app