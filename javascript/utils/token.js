"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwt_key_1 = require("../constants/jwt.key");
const generateToken = (id) => {
    const token = jsonwebtoken_1.default.sign(id, jwt_key_1.JWT_KEY);
    return token;
};
exports.generateToken = generateToken;