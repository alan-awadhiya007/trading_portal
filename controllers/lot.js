const mongoose = require("mongoose");
const conn = mongoose.connection;
const moment = require('moment');
var NODE_FS = require("fs");
var NODE_PATH = require("path");

const STATUS_CODE = require("../configs/errors");
const CONSTANTS = require("../configs/constants");
const Lot = require('../models/lot');


class LotController {
    
    /* Health Check :: GET-AA-10012025 */
    async healthCheck(req, resp) {
        console.log(`LotController.healthCheck() :: req.body : `, req.body, `req.query : `, req.query, `req.params : `, req.params, ` req.headers: `, req.headers, `req.url: `, req.url);
        let response;
        try{
            response = { error: false, message: "Health Ok", payload: req.body };
        }catch(mainErr){
            console.error(`LotController.healthCheck() :: mainErr: `, mainErr);
            response = { error: true, message: "Health not ok", payload: mainErr };
        }
        console.log(`LotController.healthCheck() :: response: `, response);
        return resp.status(STATUS_CODE.SERVER_SUCCESS).json(response);
    }
    
    

    /* GET ALL LOTS :: GET-AA-10012025 */
    async getAllLots(req, resp) {
        try {
            console.log(`LotController.getAllLots() :: req.body : `, req.body, `req.query : `, req.query, `req.params : `, req.params, ` req.headers: `, req.headers, `req.url: `, req.url);
                            
            let findAllLotsQuery = {};
            console.log(`LotController.getAllLots() :: findAllLotsQuery : `, JSON.stringify(findAllLotsQuery));

            try {
                const foundAllLotsRes = await Lot.find(findAllLotsQuery)
                // .select({})
                // .countDocuments()
                console.log(`LotController.getAllLots() :: foundAllLotsRes: `, foundAllLotsRes);
                if (!foundAllLotsRes || foundAllLotsRes.length <= 0) {
                    return resp.status(STATUS_CODE.SERVER_SUCCESS).json({
                        error: false,
                        message: `${STATUS_CODE.GEN_DATA_NOT_FOUND} Lot Details`,
                        payload: {
                            lots: [],
                            total: 0
                        },
                    });
                }

                return resp.status(STATUS_CODE.SERVER_SUCCESS).json({
                    error: false,
                    message: STATUS_CODE.SINGLE_OR_ALL_LOTS_FETCHED_SUCCESS,
                    payload: {
                        lots: foundAllLotsRes,
                        total: foundAllLotsRes.length
                    },
                });   
            } catch (foundAllLotsErr) {
                console.error(`LotController.getAllLots() :: foundAllLotsErr: `, foundAllLotsErr);
                return resp.status(STATUS_CODE.SERVER_BAD_REQUEST).json({
                    error: true,
                    message: STATUS_CODE.SINGLE_OR_ALL_LOTS_FETCHED_FAILURE,
                    errorCode: `SINGLE_OR_ALL_LOTS_FETCHED_FAILURE`,
                });
            }
        
        } catch (mainErr) {
            console.error(`LotController.getAllLots() :: mainErr: `, mainErr);
            return resp.status(STATUS_CODE.SERVER_BAD_REQUEST).json({
                error: true,
                message: STATUS_CODE.SERVER_FAILURE,
                errorCode: `SERVER_FAILURE`,
            });
        }
    }

}


module.exports = new LotController();