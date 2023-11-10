/** 
 * @author Jun Jian <jwoo0046@student.monash.edu>
 */

/** 
 * Mongoose Schema and Model for Operation class
 * @requires mongoose
 */

/** 
 * Mongose module 
 * @constant
*/
const mongoose = require("mongoose");

/** 
 * Schema for an Operation document
 * @constant
*/
const operationSchema = new mongoose.Schema({
    delete:{
        type: Number,
        validate:{
            validator(value){
                return value >= 0
            },
            message: "Number of deletes must be more than or equals to 0"
        },
        default: 0
    },

    add:{
        type: Number,
        validate:{
            validator(value){
                return value >= 0
            },
            message: "Number of additions must be more than or equals to 0"
        },
        default: 0
    },

    update:{
        type: Number,
        validate:{
            validator(value){
                return value >= 0
            },
            message: "Number of updates must be more than or equals to 0"
        },
        default: 0
    }
})

/** 
 * Model for an Operation document based on its Schema
 * @constant
*/
const Operation = mongoose.model("Operation", operationSchema)

module.exports = { Operation }