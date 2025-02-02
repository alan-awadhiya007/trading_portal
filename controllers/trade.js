const mongoose = require("mongoose");
const conn = mongoose.connection;
const moment = require('moment');
var NODE_FS = require("fs");
var NODE_PATH = require("path");

const STATUS_CODE = require("../configs/errors");
const CONSTANTS = require("../configs/constants");
const { processTrade } = require('../services/lotService');
const Trade = require('../models/trade');
const Lot = require('../models/lot');


class TradeController {
    
    /* Health Check :: GET-AA-10012025 */
    async healthCheck(req, resp) {
        console.log(`TradeController.healthCheck() :: req.body : `, req.body, `req.query : `, req.query, `req.params : `, req.params, ` req.headers: `, req.headers, `req.url: `, req.url);
        let response;
        try{
            response = { error: false, message: "Health Ok", payload: req.body };
        }catch(mainErr){
            console.error(`TradeController.healthCheck() :: mainErr: `, mainErr);
            response = { error: true, message: "Health not ok", payload: mainErr };
        }
        console.log(`TradeController.healthCheck() :: response: `, response);
        return resp.status(STATUS_CODE.SERVER_SUCCESS).json(response);
    }
    
    /* ADD TRADE DETAILS :: POST-AA-10012025 */
    async addTradeDetails(req, resp) {
        try {
            console.log(`TradeController.addTradeDetails() :: req.body : `, req.body, `req.query : `, req.query, `req.params : `, req.params, ` req.headers: `, req.headers, `req.url: `, req.url);
                
            const tradeId = req?.body?.tradeId ? parseInt(req.body.tradeId) : undefined;
            console.log(`TradeController.addTradeDetails() :: tradeId : `, tradeId);
            // if (!tradeId) {
            //     return resp.status(STATUS_CODE.SERVER_BAD_REQUEST).json({
            //         error: true,
            //         message: `${STATUS_CODE.GEN_INPUT_ERROR} tradeId`,
            //         errorCode: "INPUT_ERROR",
            //     });
            // }

            const sellingMethod = req?.body?.sellingMethod?.toUpperCase() || 'FIFO';
            console.log(`TradeController.addTradeDetails() :: sellingMethod : `, sellingMethod);

            let findQuery = { tradeId: tradeId, isActive: true, isDeleted: false };     
            console.log(`TradeController.addTradeDetails() :: findQuery : `, JSON.stringify(findQuery));

            try {
                let tradePayload = {
                    stockName: req?.body?.stockName || undefined,
                    quantity: req?.body?.quantity || 0,
                    brokerName: req?.body?.brokerName || undefined,
                    price: req?.body?.price || 0,
                };
                tradePayload.amount = tradePayload.price * tradePayload.quantity;
                console.log(`TradeController.addTradeDetails() :: tradePayload: `, tradePayload);

                const foundTradeRes = await Trade.findOne(findQuery);
                console.log(`TradeController.addTradeDetails() :: foundTradeRes: `, foundTradeRes);
                
                let msg;
                let toBeSaveTrade;
                if (!foundTradeRes || foundTradeRes.length <= 0) {
                    msg = STATUS_CODE.TRADE_ADDED_SUCCESS;
                    toBeSaveTrade = new Trade(tradePayload);
                    // return resp.status(STATUS_CODE.SERVER_SUCCESS).json({
                    //     error: false,
                    //     message: `${STATUS_CODE.GEN_DATA_NOT_FOUND} Trade Details`,
                    //     payload: {},
                    // });
                } else {
                    // foundTradeRes.userId = (tradePayload?.userId != undefined) ? tradePayload.userId : foundTradeRes.userId;
                    
                    msg = STATUS_CODE.TRADE_UPDATE_SUCCESS;
                    toBeSaveTrade = foundTradeRes;
                }

                try {
                    const addUpdtTradeRes = await toBeSaveTrade.save();
                    console.log(`TradeController.addTradeDetails() :: addUpdtTradeRes: `, addUpdtTradeRes);

                    if (addUpdtTradeRes?.quantity > 0) {
                        // Buy Trade - Create new lot
                        const lotPayload = {
                            tradeId: addUpdtTradeRes?.tradeId,
                            trade_id: addUpdtTradeRes?._id,
                            stockName: addUpdtTradeRes?.stockName,
                            lotQuantity: addUpdtTradeRes?.quantity
                        };
                        const newLot = new Lot(lotPayload);
                        const newLotCreated = await newLot.save();
                        console.log(`TradeController.addTradeDetails() :: newLotCreated: `, newLotCreated);
                    } else {
                        // Sell Trade - Process FIFO or LIFO
                        await processSellTrade(addUpdtTradeRes, sellingMethod);  // Change to 'LIFO' for LIFO processing
                    }

                    return resp.status(STATUS_CODE.SERVER_SUCCESS).json({
                        error: false,
                        message: msg,
                        payload: {
                            trade: addUpdtTradeRes
                        },
                    });

                } catch (addUpdtTradeErr) {
                    if(addUpdtTradeErr) console.error(`TradeController.addUpdateTrade() :: addUpdtTradeErr: `, addUpdtTradeErr);
                    if (addUpdtTradeErr.code == 11000) {
                        return resp.status(STATUS_CODE.SERVER_BAD_REQUEST).json({
                            error: true,
                            message: `${STATUS_CODE.DUPLICATE_KEY}: ${JSON.stringify(addUpdtTradeErr.keyValue)}`,
                            errorCode: "DUPLICATE_KEY",
                        });
                    } else {
                        return resp.status(STATUS_CODE.SERVER_BAD_REQUEST).json({
                            error: true,
                            message: STATUS_CODE.SERVER_FAILURE,
                            errorCode: "SERVER_FAILURE",
                        });
                    }
                }
                
            } catch (foundTradeErr) {
                console.error(`TradeController.addTradeDetails() :: foundTradeErr: `, foundTradeErr);
                return resp.status(STATUS_CODE.SERVER_BAD_REQUEST).json({
                    error: true,
                    message: STATUS_CODE.TRADE_UPDATE_FAILURE,
                    errorCode: `TRADE_UPDATE_FAILURE`,
                });
            }
        
        } catch (mainErr) {
            console.error(`TradeController.addTradeDetails() :: mainErr: `, mainErr);
            return resp.status(STATUS_CODE.SERVER_BAD_REQUEST).json({
                error: true,
                message: STATUS_CODE.SERVER_FAILURE,
                errorCode: `SERVER_FAILURE`,
            });
        }
    }

    /* BUY TRADE DETAILS :: POST-AA-10012025 */
    async buyTrade(req, resp) {
        try {
            console.log(`TradeController.buyTrade() :: req.body : `, req.body, `req.query : `, req.query, `req.params : `, req.params, ` req.headers: `, req.headers, `req.url: `, req.url);
                
            const tradeId = req?.body?.tradeId ? parseInt(req.body.tradeId) : undefined;
            console.log(`TradeController.buyTrade() :: tradeId : `, tradeId);
            // if (!tradeId) {
            //     return resp.status(STATUS_CODE.SERVER_BAD_REQUEST).json({
            //         error: true,
            //         message: `${STATUS_CODE.GEN_INPUT_ERROR} tradeId`,
            //         errorCode: "INPUT_ERROR",
            //     });
            // }

            const sellingMethod = req?.body?.sellingMethod?.toUpperCase() || 'FIFO';
            console.log(`TradeController.buyTrade() :: sellingMethod : `, sellingMethod);

            let findQuery = { tradeId: tradeId, isActive: true, isDeleted: false };     
            console.log(`TradeController.buyTrade() :: findQuery : `, JSON.stringify(findQuery));

            try {
                if (req?.body?.quantity && req?.body?.quantity <= 0) {
                    return resp.status(STATUS_CODE.SERVER_BAD_REQUEST).json({
                        error: true,
                        message: `${STATUS_CODE.GEN_INPUT_ERROR} quantity`,
                        errorCode: "INPUT_QUANTITY",
                    });
                }
                let tradePayload = {
                    stockName: req?.body?.stockName || undefined,
                    quantity: req?.body?.quantity || 0,
                    brokerName: req?.body?.brokerName || undefined,
                    price: req?.body?.price || 0,
                };
                tradePayload.amount = tradePayload.price * tradePayload.quantity;
                console.log(`TradeController.buyTrade() :: tradePayload: `, tradePayload);

                const foundTradeRes = await Trade.findOne(findQuery);
                console.log(`TradeController.buyTrade() :: foundTradeRes: `, foundTradeRes);
                
                let msg;
                let toBeSaveTrade;
                if (!foundTradeRes || foundTradeRes.length <= 0) {
                    msg = STATUS_CODE.TRADE_ADDED_SUCCESS;
                    toBeSaveTrade = new Trade(tradePayload);
                    // return resp.status(STATUS_CODE.SERVER_SUCCESS).json({
                    //     error: false,
                    //     message: `${STATUS_CODE.GEN_DATA_NOT_FOUND} Trade Details`,
                    //     payload: {},
                    // });
                } else {
                    // foundTradeRes.userId = (tradePayload?.userId != undefined) ? tradePayload.userId : foundTradeRes.userId;
                    
                    msg = STATUS_CODE.TRADE_UPDATE_SUCCESS;
                    toBeSaveTrade = foundTradeRes;
                }

                try {
                    const addUpdtTradeRes = await toBeSaveTrade.save();
                    console.log(`TradeController.buyTrade() :: addUpdtTradeRes: `, addUpdtTradeRes);

                    // Buy Trade - Create new lot
                    const lotPayload = {
                        tradeId: addUpdtTradeRes?.tradeId,
                        trade_id: addUpdtTradeRes?._id,
                        stockName: addUpdtTradeRes?.stockName,
                        lotQuantity: addUpdtTradeRes?.quantity
                    };
                    const newLot = new Lot(lotPayload);
                    const newLotCreated = await newLot.save();
                    console.log(`TradeController.buyTrade() :: newLotCreated: `, newLotCreated);

                    return resp.status(STATUS_CODE.SERVER_SUCCESS).json({
                        error: false,
                        message: msg,
                        payload: {
                            trade: addUpdtTradeRes
                        },
                    });

                } catch (addUpdtTradeErr) {
                    if(addUpdtTradeErr) console.error(`TradeController.buyTrade() :: addUpdtTradeErr: `, addUpdtTradeErr);
                    if (addUpdtTradeErr.code == 11000) {
                        return resp.status(STATUS_CODE.SERVER_BAD_REQUEST).json({
                            error: true,
                            message: `${STATUS_CODE.DUPLICATE_KEY}: ${JSON.stringify(addUpdtTradeErr.keyValue)}`,
                            errorCode: "DUPLICATE_KEY",
                        });
                    } else {
                        return resp.status(STATUS_CODE.SERVER_BAD_REQUEST).json({
                            error: true,
                            message: STATUS_CODE.SERVER_FAILURE,
                            errorCode: "SERVER_FAILURE",
                        });
                    }
                }
                
            } catch (foundTradeErr) {
                console.error(`TradeController.buyTrade() :: foundTradeErr: `, foundTradeErr);
                return resp.status(STATUS_CODE.SERVER_BAD_REQUEST).json({
                    error: true,
                    message: STATUS_CODE.TRADE_UPDATE_FAILURE,
                    errorCode: `TRADE_UPDATE_FAILURE`,
                });
            }
        
        } catch (mainErr) {
            console.error(`TradeController.buyTrade() :: mainErr: `, mainErr);
            return resp.status(STATUS_CODE.SERVER_BAD_REQUEST).json({
                error: true,
                message: STATUS_CODE.SERVER_FAILURE,
                errorCode: `SERVER_FAILURE`,
            });
        }
    }

    /* SELL TRADE DETAILS :: POST-AA-10012025 */
    async sellTrade(req, resp) {
        try {
            console.log(`TradeController.sellTrade() :: req.body : `, req.body, `req.query : `, req.query, `req.params : `, req.params, ` req.headers: `, req.headers, `req.url: `, req.url);
                
            const tradeId = req?.body?.tradeId ? parseInt(req.body.tradeId) : undefined;
            console.log(`TradeController.sellTrade() :: tradeId : `, tradeId);
            // if (!tradeId) {
            //     return resp.status(STATUS_CODE.SERVER_BAD_REQUEST).json({
            //         error: true,
            //         message: `${STATUS_CODE.GEN_INPUT_ERROR} tradeId`,
            //         errorCode: "INPUT_ERROR",
            //     });
            // }

            const sellingMethod = req?.body?.sellingMethod?.toUpperCase() || 'FIFO';
            console.log(`TradeController.sellTrade() :: sellingMethod : `, sellingMethod);

            let findQuery = { tradeId: tradeId, isActive: true, isDeleted: false };     
            console.log(`TradeController.sellTrade() :: findQuery : `, JSON.stringify(findQuery));

            try {
                if (req?.body?.quantity && req?.body?.quantity > 0) {
                    return resp.status(STATUS_CODE.SERVER_BAD_REQUEST).json({
                        error: true,
                        message: `${STATUS_CODE.GEN_INPUT_ERROR} quantity`,
                        errorCode: "INPUT_QUANTITY",
                    });
                }
                let tradePayload = {
                    stockName: req?.body?.stockName || undefined,
                    quantity: req?.body?.quantity || 0,
                    brokerName: req?.body?.brokerName || undefined,
                    price: req?.body?.price || 0,
                };
                tradePayload.amount = tradePayload.price * tradePayload.quantity;
                console.log(`TradeController.sellTrade() :: tradePayload: `, tradePayload);

                const foundTradeRes = await Trade.findOne(findQuery);
                console.log(`TradeController.sellTrade() :: foundTradeRes: `, foundTradeRes);
                
                let msg;
                let toBeSaveTrade;
                if (!foundTradeRes || foundTradeRes.length <= 0) {
                    msg = STATUS_CODE.TRADE_ADDED_SUCCESS;
                    toBeSaveTrade = new Trade(tradePayload);
                    // return resp.status(STATUS_CODE.SERVER_SUCCESS).json({
                    //     error: false,
                    //     message: `${STATUS_CODE.GEN_DATA_NOT_FOUND} Trade Details`,
                    //     payload: {},
                    // });
                } else {
                    // foundTradeRes.userId = (tradePayload?.userId != undefined) ? tradePayload.userId : foundTradeRes.userId;
                    
                    msg = STATUS_CODE.TRADE_UPDATE_SUCCESS;
                    toBeSaveTrade = foundTradeRes;
                }

                try {
                    const addUpdtTradeRes = await toBeSaveTrade.save();
                    console.log(`TradeController.sellTrade() :: addUpdtTradeRes: `, addUpdtTradeRes);

                    // Sell Trade - Process FIFO or LIFO
                    await processSellTrade(addUpdtTradeRes, sellingMethod);  // Change to 'LIFO' for LIFO processing

                    return resp.status(STATUS_CODE.SERVER_SUCCESS).json({
                        error: false,
                        message: msg,
                        payload: {
                            trade: addUpdtTradeRes
                        },
                    });

                } catch (addUpdtTradeErr) {
                    if(addUpdtTradeErr) console.error(`TradeController.sellTrade() :: addUpdtTradeErr: `, addUpdtTradeErr);
                    if (addUpdtTradeErr.code == 11000) {
                        return resp.status(STATUS_CODE.SERVER_BAD_REQUEST).json({
                            error: true,
                            message: `${STATUS_CODE.DUPLICATE_KEY}: ${JSON.stringify(addUpdtTradeErr.keyValue)}`,
                            errorCode: "DUPLICATE_KEY",
                        });
                    } else {
                        return resp.status(STATUS_CODE.SERVER_BAD_REQUEST).json({
                            error: true,
                            message: STATUS_CODE.SERVER_FAILURE,
                            errorCode: "SERVER_FAILURE",
                        });
                    }
                }
                
            } catch (foundTradeErr) {
                console.error(`TradeController.sellTrade() :: foundTradeErr: `, foundTradeErr);
                return resp.status(STATUS_CODE.SERVER_BAD_REQUEST).json({
                    error: true,
                    message: STATUS_CODE.TRADE_UPDATE_FAILURE,
                    errorCode: `TRADE_UPDATE_FAILURE`,
                });
            }
        
        } catch (mainErr) {
            console.error(`TradeController.sellTrade() :: mainErr: `, mainErr);
            return resp.status(STATUS_CODE.SERVER_BAD_REQUEST).json({
                error: true,
                message: STATUS_CODE.SERVER_FAILURE,
                errorCode: `SERVER_FAILURE`,
            });
        }
    }

    /* GET ALL TRADES :: GET-AA-10012025 */
    async getAllTrades(req, resp) {
        try {
            console.log(`TradeController.getAllTrades() :: req.body : `, req.body, `req.query : `, req.query, `req.params : `, req.params, ` req.headers: `, req.headers, `req.url: `, req.url);
                            
            let findAllTradesQuery = { isActive: true, isDeleted: false };
            console.log(`TradeController.getAllTrades() :: findAllTradesQuery : `, JSON.stringify(findAllTradesQuery));

            try {
                const foundAllTradesRes = await Trade.find(findAllTradesQuery)
                // .select({})
                // .countDocuments()
                console.log(`TradeController.getAllTrades() :: foundAllTradesRes: `, foundAllTradesRes);
                if (!foundAllTradesRes || foundAllTradesRes.length <= 0) {
                    return resp.status(STATUS_CODE.SERVER_SUCCESS).json({
                        error: false,
                        message: `${STATUS_CODE.GEN_DATA_NOT_FOUND} Trade Details`,
                        payload: {
                            trades: [],
                            total: 0
                        },
                    });
                }

                return resp.status(STATUS_CODE.SERVER_SUCCESS).json({
                    error: false,
                    message: STATUS_CODE.SINGLE_OR_ALL_TRADES_FETCHED_SUCCESS,
                    payload: {
                        trades: foundAllTradesRes,
                        total: foundAllTradesRes.length
                    },
                });   
            } catch (foundAllTradesErr) {
                console.error(`TradeController.getAllTrades() :: foundAllTradesErr: `, foundAllTradesErr);
                return resp.status(STATUS_CODE.SERVER_BAD_REQUEST).json({
                    error: true,
                    message: STATUS_CODE.SINGLE_OR_ALL_TRADES_FETCHED_FAILURE,
                    errorCode: `SINGLE_OR_ALL_TRADES_FETCHED_FAILURE`,
                });
            }
        
        } catch (mainErr) {
            console.error(`TradeController.getAllTrades() :: mainErr: `, mainErr);
            return resp.status(STATUS_CODE.SERVER_BAD_REQUEST).json({
                error: true,
                message: STATUS_CODE.SERVER_FAILURE,
                errorCode: `SERVER_FAILURE`,
            });
        }
    }

}

async function processSellTrade(trade, method) {
    if(method == "FIFO") {
        console.log(`FIFO (First-In, First-Out) :: Oldest stocks are sold first, ensuring older inventory is cleared before newer stocks.`);
    }
    if(method == "LIFO") {
        console.log(`LIFO (Last-In, First-Out) :: Newest stocks are sold first, ensuring recent inventory is used before older stocks.`);
    }

    let remainingQuantity = Math.abs(trade.quantity);
    const lotsFindQuery = { stockName: trade.stockName, lot_status: { $ne: 'FULLY REALIZED' } };
    console.log(`processSellTrade() :: lotsFindQuery: `, lotsFindQuery);
    let lots = await Lot.find(lotsFindQuery).sort(method === 'FIFO' ? { _id: 1 } : { _id: -1 });

    for (let lot of lots) {
        let availableQuantity = lot.lotQuantity - lot.realizedQuantity;
        let usedQuantity = Math.min(remainingQuantity, availableQuantity);

        lot.realizedQuantity += usedQuantity;
        if (lot.realizedQuantity === lot.lotQuantity) lot.lotStatus = 'FULLY REALIZED';
        else lot.lotStatus = 'PARTIALLY REALIZED';

        await lot.save();
        remainingQuantity -= usedQuantity;
        if (remainingQuantity === 0) break;
    }
}


module.exports = new TradeController();