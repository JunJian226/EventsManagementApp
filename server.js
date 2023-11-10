/** 
 * @author Jun Jian <jwoo0046@student.monash.edu>
 * @author Gunnraj Dhaliwal <ghda0007@student.monash.edu>
 */

/**
 * @requires express
 * @requires mongoose
 * @requires models/event-category
 * @requires models/event
 * @requires models/operation
 * @requires controller/stats
 * @requires routes/category-api
 * @requires routes/event-category
 * @requires routes/event-api
 * @requires routes/event
 */

/**
 * Mongoose module
 * @constant
 */
const mongoose = require("mongoose");

/** 
 * Express module 
 * @constant
*/
const express = require("express");

/**  
 * Category Model module
 * @constant
 */
const { Category } = require("./models/event-category")


/**
 * Event Model module
 * @constant
 */
const { Event } = require("./models/event");

/**
 * Operation Model Module
 * @constant
 */
const { Operation } = require("./models/operation")

/**  
 * Operation collection managing module 
 * @constant
 */
const { initialiseOperation } = require("./controller/stats")

/**
 * Category API router
 * @constant
 */
const categoryAPI = require("./routes/category-api");

/**
 * Category HTML router
 * @constant
 */
const categoryRouter = require("./routes/event-category")

/**
 * Event API router
 * @constant
 */
const eventAPI = require("./routes/event-api")

/**
 * Event HTML router
 * @constant
 */
const eventRouter = require("./routes/event");

/**
 * App instance
 * @constant
 */
const app = express();

/**
 * Configure port number
 */
app.listen(8080);

/**
 * Configure express to use middleware that parses json requests
 */
app.use(express.json());

/**
 * Configure parsing URL-encoded data from request bodies 
 * @name Encoded Data Parser
 * @function
 * @param {Object} options - configuration options for URL-encoded data parser 
 */
app.use(express.urlencoded({ extended: false }));

/**
 * The url for connecting to the mongoDB server
 * @constant
 */
const url = "mongodb://127.0.0.1:27017/category-app";

/**
 * A function that connects to the mongoDB server
 * @function
 * @param {string} url The url to connect to the mongoDB server
 * @returns A string denoting the successful connection to the mongoDB server
 */
async function connect(url) {
	await mongoose.connect(url);
    await initialiseOperation()
	return "Connected Successfully";
}

/**
 * Using the category API router for "/api/v1/category" paths
 * @name CategoryAPI Router 
 * @function
 * @param {string} path - URL path where the categoryAPI router will be mounted.
 * @param {ExpressRouter} router - the Express router to be mounted.
 */
app.use("/api/v1/category", categoryAPI);

/**
 * Using the category router for "/category" paths
 * @name Category Router 
 * @function
 * @param {string} path - URL path where the category router will be mounted.
 * @param {ExpressRouter} router - the Express router to be mounted.
 */
app.use("/category", categoryRouter);

/**
 * Using the event api router for "/api/v1/event" paths
 * @name EventAPI Router 
 * @function
 * @param {string} path - URL path where the eventAPI router will be mounted.
 * @param {ExpressRouter} router - the Express router to be mounted.
 */
app.use("/api/v1/event", eventAPI);

/**
 * Using the event router for "/event" paths
 * @name Event Router 
 * @function
 * @param {string} path - URL path where the event router will be mounted.
 * @param {ExpressRouter} router - the Express router to be mounted.
 */
app.use("/event", eventRouter);

/**
 * Set the view engine for rendering HTML templates
 * @name Set View Engine
 * @function
 * @param {string} engine - the name of the view engine to be set
 * @param {string} extension - file extension for templates associated with view engine
 */
app.set("view engine", "html");

/**  
 * Set up the EJS view engine for rendering HTML files
 * @name EJS View Engine
 * @function
 * @param {string} extension - the file extension for templates to rendered with EJS
 * @param {function} renderFunction - function responsible for rendering EJS templates 
*/
app.engine("html",require("ejs").renderFile);

/**
 * Serve static image files from the "images" directory
 * @name Static Images
 * @function
 * @param {string} directoryPath - The local directory path where the static image files are located.
 */
app.use(express.static("images"))

/**
 * Serve static files from the "node_modules/bootstrap/dist/css" directory
 * @name Static Bootstrap CSS
 * @function
 * @param {string} directoryPath - The local directory path where the static files are located.
 */
app.use(express.static("node_modules/bootstrap/dist/css"));

/** 
 * Route serving the homepage index.html
 * @name GET/ index page
 * @function
 * @param {string} path - Express path
 * @param {function} callback - Express callback
 */
app.get("/", async function(req,res){
    /**
     * The list of categories in the database
     * @type {Array}
     */
    let categoryList = await Category.find()

    /**
     * The list of events in the database
     * @type {Array}
     */
    let eventsList = await Event.find();

    /**
     * The operations object to visualise the number of operations performed on the database
     * @type {Operation}
     */
    let operationList = await Operation.findOne()
    
    res.render("index.html", {events: eventsList, categories: categoryList, operation: operationList})
});

/** 
 * Middleware for handling 404 errors by sending a 404 html page.
 * @name Handle 404 Errors
 * @function
 * @param {Object} req - the Express request object
 * @param {Object} res - the Express response object
 */
app.use((req, res) => {
    res.render(__dirname + "/views/error.html", {message: "Error 404: Page Not Found!"});
  });

connect(url)
	.then(console.log)
	.catch((err) => console.log(err));