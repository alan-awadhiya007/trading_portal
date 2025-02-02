/* HTTP/HTTPS status code*/
module.exports.SERVER_SUCCESS = 200;
module.exports.SERVER_SUCCESS_CODE = 200;
module.exports.SERVER_BAD_REQUEST = 400;
module.exports.SERVER_ERROR_CODE = 400;
module.exports.SERVER_UNAUTHORIZED = 401;
module.exports.SERVER_ERROR_FORBIDDEN_CODE = 403;
module.exports.SERVER_NOT_FOUND = 404;
module.exports.SERVER_NOT_FOUND_CODE = 404;
module.exports.SERVER_INTERNAL_ERROR_CODE = 500;
module.exports.SERVER_REQUEST_TIMEOUT_CODE = 502;

module.exports.OTP_VALIDITY = 86400000; // 1 * 24 * 60 * 60 * 1000
module.exports.WEB_TOKEN_VALIDITY = "2h" // 2 hours
module.exports.ACCESS_TOKEN_VALIDITY = "120d" // 120 days
module.exports.REFRESH_TOKEN_VALIDITY = "90d"; // 90 days

module.exports.MAX_SKU_LENGTH = 80;
module.exports.MAX_COMMON_LENGTH = 5000;
module.exports.MAX_STATE_LENGTH = 20;
module.exports.MAX_GSTIN_LENGTH = 15;
module.exports.MAX_RAZOR_ID_LENGTH = 200;
module.exports.MAX_RAZOR_SECRET_LENGTH = 200;
module.exports.MAX_INVOICEID_LENGTH = 16;

module.exports.PASSWORD_LENGTH = 8;
module.exports.MAX_PAN_LENGTH = 19;
module.exports.MAX_USERID_LENGTH = 120;
module.exports.MAX_PINCODE_LENGTH = 7;
module.exports.MAX_NAME_LENGTH = 50;
module.exports.MAX_COMMON_LENGTH = 100;
module.exports.DEFAULT_MS_CLIENT_LIMIT = 3;

module.exports.MAX_LENGTH_HEADING = 150;
module.exports.MAX_LENGTH_DESCRIPTION = 200;

module.exports.NUMBERS_OF_HOURS = 24;
module.exports.NUMBERS_OF_YEARS = 3;

module.exports.DEFAULT_PAGENO = 1;
module.exports.USERS_PER_PAGE = 0;

module.exports.OWNER_ID = 1;

module.exports.PROXY_LIMIT = "5mb"

module.exports.TOKEN_VALIDITY = 600000; // 10 mins // 86400000; // 1 * 24 * 60 * 60 * 1000
module.exports.ENCRYPTION_ALGO = "aes-256-ecb";
module.exports.RESET_PASSWORD_TOKEN = "reset_password";

module.exports.CLOUD_TYPE_ENUM = [ "AWS", "AZURE", "GCP", "OTHER" ];
module.exports.CLOUD_TYPE = {
    AWS: "AWS",
    AZURE: "AZURE",
    GCP: "GCP",
	OTHER: "OTHER",
}