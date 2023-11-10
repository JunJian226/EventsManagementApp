/**
 * @author Gunnraj Dhaliwal <gdha0007@student.monash.edu>
 */

/**
 * Mongoose for Event Schema and Model 
 * @requires mongoose 
 */

/**
 * Mongoose module
 * @constant
 */
const mongoose = require('mongoose');

/**
 * Schema for Event
 * @constant eventSchema
 */
const eventSchema = mongoose.Schema({
    eventId: {
        type: String,
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    startDateTime: {
        type: Date
    },
    durationInMinutes: {
        type: Number,
        required: true
    },
    isActive: {
        type: Boolean,
        default: false
    },
    image: {
        type: String,
        default: '/party.jpeg'
    },
    capacity: {
        type: Number,
        required: true,
        default: 100,
        validate: {
            validator: function (value) {
                /**
                 * ensure that the capacity is betwen 10 and 2000 inclusive
                 */
                return 10 <= value && value <= 2000;
            }
        }
    },
    ticketsAvailable: {
        type: Number,
        required: true
    },
    categoryList: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category"
    }]
})

function generateId() {
    return 'E' + generateRandomAlphabeticString(2) + '-' + generateRandomNumbers(4)
}

/**
 * A function to create a random alphabetic string of a specified length
 * @param {int} returnStringLength The length of the random string to be returned
 * @returns a random string of length "returnStringLength"
 */
function generateRandomAlphabeticString(returnStringLength) {
    /**
     * The string of random letters that will be returned
     * @type {string}
     */
    let results = '';
    
    /**
     * A string containing every letter, so that random letters can be generated from it
     * @constant
     * @type {string}
     */
    const CHARACTERS = 'abcdefghijklmnopqrstuvwxyz';

    /**
     * The length of the string of every unique letter that the result will be generated from
     * @type {number}
     */
    let charLength = CHARACTERS.length;

    for (let i = 0; i < returnStringLength; i++) {
        results += CHARACTERS.charAt(Math.floor(Math.random() * charLength));
    }

    return results.toUpperCase();
}

/**
 * A function that generates a random number of a specified length
 * @param {int} length the number of digits or 'length'' of the random number
 * @returns a random number of a specified length
 */
function generateRandomNumbers(length) {
    /**
     * The length of the random number that will be returned
     * @type {number}
     */
    let numOfDigits = 10 ** (length - 1);

    /**
     * The random number of the specified length that will be returned
     */
    let result = Math.floor(numOfDigits + Math.random() * numOfDigits * 9);
    
    return result;
}

/**
 * Model for Event document vased upon its schema
 * @const Event
 */
const Event = mongoose.model('Event', eventSchema);

module.exports = {
    generateId,
    Event
}