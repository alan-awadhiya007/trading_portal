const express = require("express");
const router = express.Router();

const tradeController = require("../controllers/trade.js");
// const { validateAdminOrSuperAdmin } = require("../validators/routeValidators.js");
// const { localUpload, cloudUpload } = require("../utils/multer_utils");

router.get("/hc", tradeController.healthCheck);
router.post("/add", tradeController.addTradeDetails);
router.post("/buy", tradeController.buyTrade);
router.post("/sell", tradeController.sellTrade);
router.get("/all", tradeController.getAllTrades);

module.exports = router;