/**
 * @author Gunnraj Dhaliwal <gdha0007@student.monash.edu>
 */

/**
 * @requires express
 * @requires models/event
 * @requires models/helper-functions
 * @requires models/event-category
 * @requires controller/stats
 */

/** 
 * Express module 
 * @constant
*/
const express = require('express');

/**
 * Event Model module
 * @constant
 */
const { Event } = require("../models/event");

/**
 * Event Creation helper function
 * @constant
 */
const { createNewEvent } = require("../models/helper-functions");

/**  
 * Category Model module
 * @constant
 */
const { Category } = require("../models/event-category");

/**  
 * Operation collection managing module 
 * @constant
 */
const { updateOperation } = require("../controller/stats");

/** 
 * Router instance
 * @constant
 */
const router = express.Router();

/** 
 * Router serving RESTful API version of adding event to mongoDB collection
 * @name POST/ Adding Event
 * @function
 * @param {string} req.body.name Name in JSON object (from body request)
 * @param {string} req.body.decription Description in JSON object (from body request)
 * @param {string} req.body.startDateTime Start date in JSON object (from body request)
 * @param {string} req.body.durationInMinutes Duration in minutes in JSON object (from body request)
 * @param {string} req.body.isActive Boolean of activity state in JSON object (from body request)
 * @param {string} req.body.image Image Path in JSON object (from body request)
 * @param {string} req.body.capacity Capacity of event in JSON object (from body request)
 * @param {string} req.body.ticketsAvailable Number of tickets in JSON object (from body request)
 * @param {Function} callback - Express callback
 */
router.post("/Gunnraj/add-event", async function (req, res) {
    try {
        /**
         * An new event according to the provided data
         * @type {Event}
         */
        let anEvent = await createNewEvent(req);

        res.status(200).json({
            "eventId": anEvent.eventId
        });
    }
    catch (err){
        res.status(500).json(err)
    }
}) 

/**
 * Router serving RESTful API version of listing all the events and their linked categories in json form.
 * @name GET/ List Events
 * @function
 * @param {string} path - Express path
 * @param {Function} callback - Express callback
 */
router.get("/Gunnraj/events", async function (req, res) {
    try {
        /**
         * An array of of event objects from the database
         * @type {Array}
         */
        let events = await Event.find().populate("categoryList");
        res.json(events);
    }
    catch (err) {
        res.status(500).json(err)
    }
})

/**
 * Router serving RESTful API version of deleting an Event and all the event references listed in its categories
 * @name DELETE/ Delete Category
 * @function
 * @param {string} path - Express path
 * @param {string} req.body.categoryId - eventId inputted in json of request body
 * @param {Function} callback - Express callback
 */
router.delete("/Gunnraj/delete-event", async function (req, res) {
    try {
        /**
         * the event with the matching eventId
         * @type {Event}
         */
        let eventDatabaseId = await Event.findOne({"eventId": req.body.eventId}, "_id");

        if (eventDatabaseId === null) {
            res.status(400).json({
                "acknowledged": false,
                "deletedCount": 0,
            })
            return
        }

        eventDatabaseId = eventDatabaseId._id.toString();

        await Event.findByIdAndDelete(eventDatabaseId)
        await updateOperation("delete");

        /**
        * The ids of the categories associated with the event in an array
        * @type {Array}
        */
        let categories = await Category.find({eventsList: {$in: [eventDatabaseId]}})

        /**
         * The number of deletions that occurred
         * @type {Number}
         */
        let numberOfDeletions = 1

        /**
         * Deletes the references to the event in the associated categories
         */
        for (const category of categories) {
            /**
             * The index of the event in the associated category
             * @type {Number}
             */
            let eventIndex = category.eventsList.indexOf(eventDatabaseId);
            category.eventsList.splice(eventIndex, 1);
            await category.save();
        }

        res.status(200).json(
            {
                "acknowledged": true,
                "deletedCount": numberOfDeletions
            }
        )
    }
    catch (err) {
        res.status(500).json(err);
    }
})

/** 
 * Router serving RESTful API version of updating an Event document
 * @name PUT/ Updating Event
 * @function
 * @param {string} path - Express path
 * @param {stirng} req.body.eventId - Id of the event to update
 * @param {string} req.body.name - New name of the event
 * @param {string} req.body.capacity - New capacity amount of the event
 * @param {Function} callback - Express callback
 */
router.put("/Gunnraj/update-event", async function (req, res) {
    try {
        /**
         * Update object with the attributes to be updated
         * @type {Object}
         */
        let update = { name: req.body.name, capacity: parseInt(req.body.capacity)}

        /**
         * An Event object of the event that is to be updated
         * @type {Event}
         */
        let theEvent = await Event.findOneAndUpdate({eventId: req.body.eventId}, update, {runValidators: true});

        if (theEvent === null) {
            res.status(400).json({
                "status": "No matching event found"
            })
            return
        }
        
        await updateOperation("update");

        res.status(200).json({
            "status": "updated successfully"
        })
    }
    catch (err) {
        res.status(500).json(err);
    }
})

module.exports = router
