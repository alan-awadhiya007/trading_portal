const express = require("express");
const router = express.Router();

const lotController = require("../controllers/lot.js");
// const { validateAdminOrSuperAdmin } = require("../validators/routeValidators.js");
// const { localUpload, cloudUpload } = require("../utils/multer_utils");

router.get("/hc", lotController.healthCheck);
router.get("/all", lotController.getAllLots);

module.exports = router;