/** 
 * @author Jun Jian <jwoo0046@student.monash.edu>
 */

/** 
 * Operation collection managing functions
 * @requires operation
 */

/**  
 * Operation Model module
 * @constant
 */
const { Operation } = require("../models/operation")

/**
 * update Operation counts in the objects and the mongoDB
 * @param {"add" | "delete" | "update"} typeOfOperation - type of operation to increment
 */
async function updateOperation(typeOfOperation){
    /**
     * Mongoose query object that contains one of the operation in Operation collection
     * @type {Query}
     */
    let operations = await Operation.findOne()
    await Operation.updateOne(operations, {[typeOfOperation]: operations[typeOfOperation] + 1})
}

/**
 * Function that ensures operation collection only have one operation document in it
 */
async function initialiseOperation(){
    /**
     * Mongoose query object that contains all operation in Operation collection
     * @type {Query}
     */
    let operationList = await Operation.find({})
    
    if (operationList.length <= 0){
        /** 
         * An instance of the operation model
         * @type {Document}
         */
        let newOperation = new Operation()
        await newOperation.save()
    }
}

module.exports = { updateOperation, initialiseOperation }