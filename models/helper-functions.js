/**
 * @author Gunnraj Dhaliwal <gdha0007@student.monash.edu>
 */

/**
 * @requires models/event
 * @requires controller/stats
 * @requires models/event-category
 */

/**  
 * Category Model module (including utility function for generateID)
 * @constant
 */
const { generateId, Event } = require("./event");

/**  
 * Operation collection managing module 
 * @constant
 */
const { updateOperation } = require("../controller/stats");

/**
 * Category model module
 * @constants
 */
const { Category } = require("./event-category")

/**
 * Formats the duration from minutes to a string of hours and minutes
 * @function
 * @param {number} min - duration in minutes
 * @returns {string} the formatted duration in hours and minutes
 */
function formatDuration(min) {
    /**
     * Number of hours in the duration
     * @type {number} 
     */
    let hours = Math.floor(min/60);

    /**
     * Number of remaining minutes in the duration
     * @type {number}
     */
    let minutes = min%60;

    /**
     * formatted duration string to be returned
     * @type {string}
     */
    let retString = "";
    if (hours>0){
        retString += hours + "hour(s) "
    }
    if (minutes>0){
        retString += minutes + "minute(s)"
    }
    return retString
}

/**
 * An asynchronous function that creates a new event, adding its id to the categories associated with it
 * @function
 * @param {string} req.body.name Name in JSON object (from body request)
 * @param {string} req.body.decription Description in JSON object (from body request)
 * @param {string} req.body.startDateTime Start date in JSON object (from body request)
 * @param {string} req.body.durationInMinutes Duration in minutes in JSON object (from body request)
 * @param {string} req.body.isActive Boolean of activity state in JSON object (from body request)
 * @param {string} req.body.image Image Path in JSON object (from body request)
 * @param {string} req.body.capacity Capacity of event in JSON object (from body request)
 * @param {string} req.body.ticketsAvailable Number of tickets in JSON object (from body request)
 * @returns {Event} The created event object
 */
async function createNewEvent(req) {
    /**
     * The capacity of the event
     * @type {number}
     */
    let capacity = !req.body.capacity ? 100 : parseInt(req.body.capacity);

    /**
     * The number of tickets for the event, will default to capacity not provided, or the capacity if it exceeds capacity
     * @type {number}
     */
    let ticketsAvailable = !req.body.ticketsAvailable ? capacity : parseInt(req.body.ticketsAvailable);

    if (ticketsAvailable > capacity) {
        ticketsAvailable = capacity;
    }

    /**
     * An new event according to the provided data
     * @type {Event}
     */
    let anEvent = new Event({ eventId: generateId(), name: req.body.name, 
        description: req.body.description, startDateTime: new Date(req.body.startDateTime), 
        durationInMinutes: parseInt(req.body.durationInMinutes), 
        isActive: req.body.isActive === true || req.body.isActive === "true" ? true : false, 
        image: !req.body.image ? undefined : req.body.image, 
        capacity: capacity, ticketsAvailable: ticketsAvailable});

    await anEvent.save();
    await updateOperation("add");

    /**
     * The ids of the categories associated with the event in an array
     * @type {Array}
     */
    let categoryIds = req.body.categories ? req.body.categories.split(',') : undefined;

    /**
     * An array of category documents that have the matching Ids provided
     * @type {Array}
     */
    let categories = await Category.find({ "id": categoryIds})

    /**
     * An array to be populated with the mongo Ids of the associated categories
     * @type {Array}
     */
    let databaseIdList = [];
    
    /**
     * Pushing the event mongo Id into the categories, whilst also saving the category mongo Ids
     */
    for (const category of categories) {
        category.eventsList.push(anEvent._id);
        await category.save();
        databaseIdList.push(category._id);
    }

    anEvent.categoryList.push(...databaseIdList);
    await anEvent.save();

    return anEvent;
}

module.exports = { formatDuration, createNewEvent };
