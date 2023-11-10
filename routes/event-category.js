/** 
 * @author Jun Jian <jwoo0046@student.monash.edu>
 */

/** 
 * Express router providing category-related routes 
 * @requires express
 * @requires path
 * @requires models/event-category
 * @requires controllers/stats
 * @requires models/helper-functions
 */

/** 
 * Express module 
 * @constant
*/
const express = require('express');

/**  
 * Path module
 * @constant
 */
const path = require('path');

/**  
 * Category class module 
 * @constant
*/
const {generateID, Category} = require("../models/event-category");

/**
 * Operation counter controlling module
 * @constant
 */
const {updateOperation} = require("../controller/stats")

/** 
 * Destructuring a function from Data format parsing module 
 * @constant
*/
const {formatDuration} = require('../models/helper-functions');

/**  
 * String for directory path to views folder
 * @constant
*/
const VIEWS_PATH = path.join(path.dirname(__dirname), "/views/")

/** 
 * Router instance
 * @constant
 */
const router = express.Router();

/** 
 * Router serving adding categories functionality and html.
 * @name GET/ Adding Category
 * @function
 * @param {string} path - Express path
 * @param {Function} callback - Express callback
 */
router.get("/33469660/add", function(req,res){
    try{
        res.render(VIEWS_PATH + "add-category.html");
    } catch(err){
        res.render(VIEWS_PATH + "error.html", {message: String(err)})
    }
});

/** Router for adding a category to the database.
 * @name POST/ Adding-Category
 * @function
 * @param {string} req.body.name - name of category inputted
 * @param {string} req.body.description - description of the category inputted
 * @param {string} req.body.image - image path of the category inputted
 * @param {string} path - Express path
 * @param {Function} callback - Express callback
*/
router.post("/33469660/add-post", async function(req,res){
    try{
        /**
         * A new category of the category model instantiated from the body of the request
         * @type {Document}
         */
        let newCategory = new Category({
            id: generateID(),
            name: req.body.name,
            description: (req.body.description)?req.body.description:"",
            image: (req.body.image)?req.body.image:"",  
            createdAt: new Date()
        });

        await newCategory.save()
        await updateOperation("add")
        res.redirect("/category/33469660/view-categories");
    } catch (err){
        res.render(VIEWS_PATH + "error.html", {message: String(err)})
    }
});

/** Router serving viewing unfiltered list of categories.
 * @name GET/ View-Categories
 * @function
 * @param {string} path - Express path
 * @param {Function} callback - Express callback
*/
router.get("/33469660/view-categories", async function(req,res){
    try{
        /**
         * Mongoose query object of all category documents
         * @type {Query}
         */
        let record = await Category.find()
        res.render(VIEWS_PATH + "view-category.html", {records: record, searchKeyWord: undefined});
    } catch (err){
        res.render(VIEWS_PATH + "error.html", {message: String(err)})
    }
})

/** Router serving viewing a filtered list of categories containing the searched keyword in their description.
 * @name GET/ search-category
 * @function
 * @param {string} path - Express path
 * @param {string} req.query.keyword - keyword submitted to filter with
 * @param {Function} callback - Express callback
*/
router.get("/33469660/search-category", async function(req,res){
    try{
        /**
         * The keyword inputted 
         * @type {string}
         */
        let keyWord = String(req.query.keyword);

        /**
         * Mongoose query object containing all the category documents
         * @type {Query}
         */
        let record = await Category.find({})

        res.render(VIEWS_PATH + "view-category.html", {records: record, searchKeyWord: keyWord.toLowerCase() });
    } catch(err){
        res.render(VIEWS_PATH + "error.html",{message: String(err)})
    }
})

/** Router for searching keyword in the descriptions of categories in the database.
 * @name POST/ search-category
 * @function
 * @param {string} req.body.searchKeyWord - the keyword used to filter the list
 * @param {string} path - Express path
 * @param {Function} callback - Express callback
*/
router.post("/33469660/search-category", async function(req,res){
    try{
        /**
         * The keyword string submitted from the html form
         * @type {string}
         */
        let keyWord = String(req.body.searchKeyWord);

        /**
         * Mongoose query object containing all the category documents
         * @type {Query}
         */
        let record = await Category.find({})

        res.render(VIEWS_PATH + "view-category.html", {records: record, searchKeyWord: keyWord.toLowerCase() });
    } catch(err){
        res.render(VIEWS_PATH + "error.html",{message: String(err)})
    }
})

/** Router serving the deletion of a category from the database.
 * @name GET/ delete-category
 * @function
 * @param {string} path - Express path
 * @param {Function} callback - Express callback
*/
router.get("/33469660/delete-category", async function(req,res){
    try{
        /**
         * Mongoose query object containing all the category documents
         * @type {Query}
         */
        let record = await Category.find({})
        res.render(VIEWS_PATH + "delete-category.html", {records: record})
    } catch(err){
        res.render(VIEWS_PATH + "error.html",{message: String(err)})
    }
})

/** Router for deleting a category from the database.
 * @name POST/ delete-category
 * @function
 * @param {string} req.body.id - the ID of the category to be removed
 * @param {string} path - Express path
 * @param {Function} callback - Express callback
*/
router.post("/33469660/delete-post", async function(req,res){
    try{
        /**
         * The id string submitted from the html form
         * @type {string}
         */
        let id = String(req.body.id);
        let deleteResult = await Category.deleteOne({"id": id})
        if (deleteResult.deletedCount >= 1){
            await updateOperation("delete")
        }
        res.redirect("/category/33469660/view-categories");
    } catch(err){
        res.render(VIEWS_PATH + "error.html",{message: String(err)})
    }
})

/** 
 * Router for showing the details of a Category
 * @name GET/ Category details
 * @function
 * @param {string} req.params.categoryId - The ID of the category to show the details of
 * @param {string} path - Express path
 * @param {Function} callback - Express callback
 */
router.get('/Gunnraj/category-details/:categoryId', async function (req, res) {
    try{
        /**
         * The string of the category id
         * @type {string}
         */
        let categoryId = req.params.categoryId;

        /**
         * The associated category of the category id provided
         * @type {Category}
         */
        let category = await Category.findOne({"id": categoryId}).populate("eventsList");

        if (!category) {
            res.render("no-category-event", {eventOrCategory: "Category"});
            return;
        }

        /**
         * The array of event ids associated with the category
         * @type {Array}
         */
        let events = category.eventsList;
        
        for (const event of events) {
            await event.populate("categoryList");
        }
        
        res.render("category-details", {category: category, events: events, formatDuration: formatDuration});
    } catch(err){
        res.render(VIEWS_PATH + "error.html", {message: String(err)})
    }
})

module.exports = router;