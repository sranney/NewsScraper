var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var db = require("./models");


var exphbs = require("express-handlebars");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

var port = process.env.PORT || 5000;

app.listen(port,function(err){
})

app.engine("handlebars", 
	exphbs({ 
		defaultLayout: "main",
		partialsDir:[__dirname+"/views/partials"]
	 }));//make the main.handlebars be the layout template
app.set("view engine","handlebars");//set the express view engine as handlebars

mongoose.Promise = Promise;
mongoose.connect(process.env.MONGODB_URI, {
  useMongoClient: true
});

require("./controllers/routes.js")(app,
							db.NewsSchema_HN,
							db.NewsSchema_TC,
							db.Note);
