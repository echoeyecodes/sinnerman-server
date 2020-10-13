"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateLikeRequest = void 0;
const express_validator_1 = require("express-validator");
function validateLikeRequest(type) {
    switch (type) {
        case 'add':
            return [
                express_validator_1.body("video_id", "video_id must be provided").exists(),
                express_validator_1.query("type", "Parameter 'type' must be provided").exists(),
                express_validator_1.query("type", "Parameter 'type' must be a string").isString(),
                express_validator_1.query("type", "Parameter 'type' must be either 0 or 1").isIn(["0", "1"])
            ];
        case 'find':
            return [
                express_validator_1.check('id', "id parameter must be UUID").isUUID()
            ];
        default:
            return [];
    }
}
exports.validateLikeRequest = validateLikeRequest;
