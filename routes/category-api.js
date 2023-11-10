/** 
 * @author Jun Jian <jwoo0046@student.monash.edu>
 */

/** 
 * Express router providing category-related API routes 
 * @requires express
 * @requires models/event-category
 * @requires models/event
 * @requires controllers/stats
 */

/** 
 * Express module 
 * @constant
*/
const express = require("express");

/**  
 * Category Model module (including utility function for generateID)
 * @constant
 */
const {generateID, Category} = require("../models/event-category");

/**
 * Event Model module
 * @constant
 */
const { Event } = require("../models/event")

/**  
 * Operation collection managing module 
 * @constant
 */
const { updateOperation } = require("../controller/stats")

/** 
 * Router instance
 * @constant
 */
const router = express.Router();

/** 
 * Router serving RESTful API version of adding category to mongoDB collection
 * @name POST/ Adding Category
 * @function
 * @param {string} path - Express path
 * @param {string} req.body.name - Name in JSON object (from body request)
 * @param {string} req.body.decription - Description in JSON object (from body request)
 * @param {string} req.body.image - Image Path in JSON object (from body request)
 * @param {Function} callback - Express callback
 */
router.post("/33469660/add", async function(req,res){
    try{
        /**
         * A new category of the category model instantiated from the JSON data from body of HTTP request.
         * @type {Document}
         */
        let newCategory = new Category({
            id: generateID(),
            name: req.body.name,
            description: (req.body.description)?req.body.description:"",
            image: (req.body.image)?req.body.image:"",  
            createdAt: new Date()
        })

        await newCategory.save()
        await updateOperation("add")
        res.status(200).json({ "id": newCategory.id })
    }
    catch (err){
        res.status(500).send({
            message: String(err.message)
        })
    }
})

/**
 * Router serving RESTful API version of listing all the categories and their linked events in json form.
 * @name GET/ List Categories
 * @function
 * @param {string} path - Express path
 * @param {Function} callback - Express callback
 */
router.get("/33469660/list", async function(req,res){
    try{
        /**
         * An event-populated category list 
         * @constant
         */
        const categories = await Category.find().populate("eventsList");
        res.status(200).json(categories);
    } catch (err){
        res.status(500).send({
            message: String(err.message)
        })
    }
})

/**
 * Router serving RESTful API version of deleting a category and all the events listed in its eventList
 * @name DELETE/ Delete Category
 * @function
 * @param {string} path - Express path
 * @param {string} req.body.categoryId - categoryId inputted in json of request body
 * @param {Function} callback - Express callback
 */
router.delete("/33469660/delete", async function(req,res){
    try{
        /** 
         * A list of objectIDs of events in the to-be-deleted category's events list
         * @constant
         */
        const theCategory = (await Category.findOne({id: req.body.categoryId}))
        
        if (theCategory === null){
            res.status(400).json({
                "acknowledged": false,
                "deletedCount": 0
            })
            return
        }

        /**
         * The extracted array of events ObjectIds
         * @constant
         */
        const eventsList = theCategory.eventsList
        
        eventsList.map( async (ele) => await Event.findByIdAndDelete(ele))

        /**
         * The results of the delete operation (incl acknowledgement and deletedCount)
         * @type {DeleteResult}
         */
        let deleteResult = await Category.deleteOne({id: req.body.categoryId})
        if (deleteResult.deletedCount >= 1){
            await updateOperation("delete")
        }
        res.status(200).json(deleteResult)
    } catch(err){
        res.status(500).send({
            message: String(err.message)
        })
    }
})

/** 
 * Router serving RESTful API version of updating a category document
 * @name PUT/ Updating Category
 * @function
 * @param {string} path - Express path
 * @param {stirng} req.body.categoryId - Id of the category to update
 * @param {string} req.body.name - Name inputted to update to
 * @param {string} req.body.description - Description inputted to update to
 * @param {Function} callback - Express callback
 */
router.put("/33469660/update", async function(req,res){
    try{
        /**
         * Mongoose Query object showing the results of update operation
         * @constant
         */
        const returnData = await Category.updateOne({id: req.body.categoryId}, {name: req.body.name, description: req.body.description}, {runValidators: true})

        /**
         * A string to represent what has occured from the updateOne operation
         * @type {String}
         */
        let message = ""

        if (returnData.acknowledged){
            if (returnData.matchedCount >= 1){
                if (returnData.modifiedCount >= 1){ message = "Update is successful" }
                else { message = "ID is found but no updates were made" }
                await updateOperation("update")
            } else { message = "ID not found" }
        } else { message = "Update is not acknowledged" }
        
        res.status(200).json({ "status": message})
    } catch (err){
        res.status(500).send({
            message: String(err.message)
        })
    }
})

module.exports = router;