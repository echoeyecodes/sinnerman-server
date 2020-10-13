"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCommentRequest = void 0;
const express_validator_1 = require("express-validator");
function validateCommentRequest(type) {
    switch (type) {
        case "add":
            return [
                express_validator_1.body("video_id", "Required parameter video_id is missing").exists(),
                express_validator_1.body("comment", "Required parameter 'comment' is missing").exists(),
                express_validator_1.body("video_id", "video_id must be of type UUID").isUUID(),
            ];
        case 'one':
            return [
                express_validator_1.param("id", "Required parameter video_id is missing").exists(),
                express_validator_1.param("id", "id must be of type UUID").isUUID(),
            ];
        default:
            return [];
    }
}
exports.validateCommentRequest = validateCommentRequest;
