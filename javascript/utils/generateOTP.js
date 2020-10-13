"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const randomatic_1 = __importDefault(require("randomatic"));
function generateOTP() {
    return randomatic_1.default("0", 6);
}
exports.default = generateOTP;
