"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateViewRequest = void 0;
const express_validator_1 = require("express-validator");
function validateViewRequest() {
    return [
        express_validator_1.body("video_id", "video_id must be provided").exists(),
    ];
}
exports.validateViewRequest = validateViewRequest;
