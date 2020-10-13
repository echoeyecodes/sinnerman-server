"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
function verifyPassword(password, reference) {
    const isValid = bcryptjs_1.default.compareSync(password, reference);
    return isValid;
}
exports.default = verifyPassword;
