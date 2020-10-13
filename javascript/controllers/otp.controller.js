"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Otp_1 = __importDefault(require("../models/Otp"));
const GenericController_1 = __importDefault(require("./GenericController"));
class OtpController extends GenericController_1.default {
    constructor() {
        super(Otp_1.default);
    }
}
exports.default = OtpController;
