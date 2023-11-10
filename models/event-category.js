/** 
 * @author Jun Jian <jwoo0046@student.monash.edu>
 */

/** 
 * Mongoose Schema and Model for Category class
 * @requires mongoose
 */

/** 
 * Mongoose module 
 * @constant
*/
const mongoose = require("mongoose");

/** 
 * Schema for a Category document
 * @constant
*/
const categorySchema = new mongoose.Schema({
    id: {
        type: String,
    },

    name: {
        type: String,
        validate: {
            validator: function(value){
                /** A regular expression that matches any combination of just alphanumeric values and spaces
                /*  Basically this regexp mean from the start(^) and end($),
                /*      there must be one or more alphanumeric value [a-zA-Z0-9]+  , 
                /*      followed by a space 0 or more times [ ]*
                /*      this combination is repeated one or more times ( ... )+
                */      
                const possibleValues = /^([a-zA-Z0-9]+[ ]*)+$/
                return possibleValues.test(value)
            },
            message: "Name can only contain alphanumeric values. Name cannot start with space. Name must have atleast one alphanumeric value."
        },
        required: true
    },

    description: {
        type: String
    },

    image: {
        type: String
    },

    createdAt: {
        type: Date,
        default: new Date(),
    },

    eventsList: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
    }]
})

/** 
* Generates a random ID following the format of an ID. 
* @return {string} the string of ID generated.
*/
function generateID(){
    /** 
    * Function that generates a string of random uppercase characters.
    * @param {number} [amount=1] - the number of random characters to generate
    * @return {string} the string of random uppercase characters generated
    */
    const generateRandomCharacters = (amount = 1) => {
        /** 
         * Unicode for the first uppercase character
         * @constant
         */
        const UPPERCASE_UNICODE = 65;

        /** 
         * The string of random uppercase character generated to be returned
         * @type {string}
         */
        let retString = ""
        for(let no = 0; no < amount; no++){
            retString += String.fromCharCode( UPPERCASE_UNICODE + Math.floor(Math.random()*26) );
        }
        return retString;
    }

    /** 
     * Function that generates a string of random numbers.
     * @param {number} [amount=1] - the number of digits to generate
     * @return {string} the string of digits generated.
     */
    const generateRandomNumbers = (amount = 1) => {
        /** 
         * The string of random number digits generated to be returned
         * @type {string}
         */
        let retString = ""
        for(let no = 0; no < amount; no++){
            retString += Math.floor(Math.random()*10);
        }
        return retString;
    }

    return `C${generateRandomCharacters(2)}-${generateRandomNumbers(4)}`
}

/** 
 * Model for a Category document based on its Schema
 * @constant
*/
const Category = mongoose.model("Category", categorySchema)

module.exports = { 
    generateID, 
    Category
}


