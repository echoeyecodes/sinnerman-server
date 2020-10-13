"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateOtpRequest = void 0;
const express_validator_1 = require("express-validator");
function validateOtpRequest(type) {
    switch (type) {
        case "verify":
            return [
                express_validator_1.body("otp", "otp not provided").exists(),
                express_validator_1.body("email", "email not provided or is invalid").exists().isEmail()
            ];
        case "create":
            return [
                express_validator_1.body("email", "email not provided or is invalid").exists().isEmail(),
            ];
        default:
            return [];
    }
}
exports.validateOtpRequest = validateOtpRequest;
