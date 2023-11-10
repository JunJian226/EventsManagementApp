/**
 * @author Gunnraj Dhaliwal <ghda0007@student.monash.edu>
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
 * Event class module
 * @constant
 */
const { Event } = require('../models/event');

/**
 * Destructering functions from helper-functions module
 * @constant
 */
const { formatDuration, createNewEvent } = require('../models/helper-functions')

/**  
 * Operation collection managing module 
 * @constant
 */
const { updateOperation } = require("../controller/stats");

/**
 * router instance
 * @constant
 */
const router = express.Router();

/**
 * Route serving the add event functionality
 * @name GET/ Adding Event
 * @function
 * @param {Function} callback Express callback function 
 */
router.get('/Gunnraj/add-event', function (req, res) {
    res.render("add-event.html");
});


/**
 * Route serving the add event to database
 * @name POST/ Adding Event
 * @function
 * @param {string} req.body.name The name of the event
 * @param {DateTime} req.body.startDate The start date of the event
 * @param {number} req.body.duration The duration of the event
 * @param {string} req.body.categoryId The category Id of the event
 * @param {string} req.body.description The description of the event
 * @param {string} req.body.isActive Whether the event is active
 * @param {string} req.body.imagePath The path to the image for the event
 * @param {number} req.body.capacity The capacity of the event
 * @param {string} req.body.ticketsAvailable The number of tickets available for the event
 * @param {Function} callback Express callback function 
 */
router.post('/Gunnraj/add-event', async function (req, res) {
    await createNewEvent(req);

    res.redirect('/event/Gunnraj/events');
});


/**
 * Route serving the show events functionality
 * @name GET/ Showing Events
 * @function
 * @param {Function} callback Express callback function 
 */
router.get('/Gunnraj/events', async function (req, res) {
    /**
     * An array of of event objects from the database
     * @type {Array}
     */
    let events = await Event.find().populate("categoryList");

    res.render('events', {title: "All Events", events: events, formatDuration: formatDuration});
});


/**
 * Route serving the show sold out event functionality
 * @name GET/ Show sold out events
 * @function
 * @param {Function} callback Express callback function 
 */
router.get('/Gunnraj/sold-out-events', async function (req, res) {
    /**
     * An array of of event objects from the database that have 0 tickets available
     * @type {Array}
     */
    let events = await Event.find({ticketsAvailable: 0}).populate("categoryList");
    res.render('events', {title: "Sold Out Events", events: events, formatDuration: formatDuration});
});

/**
 * Route serving the delete event functionality
 * @name GET/ Deleting Event
 * @function
 * @param {Function} callback Express callback function 
 */
router.get('/Gunnraj/delete-event', async function (req, res) {
    /**
     * Event Id that will be deleted
     * @type String
     */
    let eventId = req.query.eventId;

    /**
     * The deleted event. Is null if there was no event or is the deleted event
     * @type {Event}
     */
    let result = await Event.findOneAndDelete({"eventId": eventId});

    if (result !== null) {
        await updateOperation("delete");
        res.redirect('/event/Gunnraj/events');
    }
    else {
        res.render('delete-event', {eventId: eventId});
    }
});

/** 
 * Router for showing the details of the event
 * @name GET/ Event details
 * @function
 * @param {string} req.params.eventID - The ID of the event to show details of
 * @param {string} path - Express path
 * @param {Function} callback - Express callback
 */
router.get('/33469660/:eventID', async function (req,res) {
    /**
     * The event specified by the request parameters
     * @type {Event}
     */
    let theEvent = await Event.findOne({"eventId": req.params.eventID});

    if (!theEvent){
        res.render("no-category-event", {eventOrCategory: "Event"});
        return;
    }

    /**
     * The finalDateTime calculated from duration and StartDateTime
     * @type {Date} 
     */
    let finalDate = new Date(theEvent.startDateTime.getTime());

    finalDate.setMinutes(finalDate.getMinutes() + theEvent.durationInMinutes)

    /**
     * An array of category database Ids
     * @type {Array}
     */
    let categoryIdList = (await theEvent.populate('categoryList')).categoryList

    /**
     * An array of category id strings
     * @type {Array}
     */
    let stringOfCategories = categoryIdList.map((ele) => ele.id).join(", ")

    res.render('event-details.html', {event: theEvent,
        startTime: theEvent.startDateTime.toLocaleString(),
        endTime: finalDate.toLocaleString(),
        duration: formatDuration(theEvent.durationInMinutes), 
        categoryIds: stringOfCategories })
});

module.exports = router;