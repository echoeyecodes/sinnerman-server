"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUsernameExists = exports.validateAuthRequest = exports.validateHeaders = exports.validateToken = exports.validateTokenMiddleware = void 0;
const express_validator_1 = require("express-validator");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwt_key_1 = require("../constants/jwt.key");
const User_1 = __importDefault(require("../models/User"));
function validateHeaders() {
    return [
        express_validator_1.header("x-api-key", "field value x-api-key is required").exists(),
        //this shouldn't be used in production
        //only used to verify the api key is equal to an actual valid value
        express_validator_1.header("x-api-key", "Invalid api key").equals("123456789")
    ];
}
exports.validateHeaders = validateHeaders;
function validateToken() {
    return [
        express_validator_1.header("token", "field value token is required but not provided").exists()
    ];
}
exports.validateToken = validateToken;
const validateTokenMiddleware = (req, res, next) => {
    const token = req.header("token");
    try {
        const id = jsonwebtoken_1.default.verify(token, jwt_key_1.JWT_KEY).toString();
        req.id = id;
        next();
    }
    catch (error) {
        throw error("Invalid token");
    }
};
exports.validateTokenMiddleware = validateTokenMiddleware;
function validateAuthRequest(type) {
    switch (type) {
        case "login":
            return [
                express_validator_1.body("username", "username not provided").exists(),
                express_validator_1.body("password", "password not provided").exists()
            ];
        case "signup":
            return [
                express_validator_1.body("username", "username not provided").exists(),
                express_validator_1.body("password", "password not provided").exists(),
                express_validator_1.body("email", "email not provided or is invalid").exists().isEmail(),
                express_validator_1.body("fullname", "fullname not provided").exists(),
            ];
        default:
            return [];
    }
}
exports.validateAuthRequest = validateAuthRequest;
function validateUsernameExists(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { username } = req.body;
        const user = yield User_1.default.findOne({ where: { username } });
        if (user) {
            return res.send(true);
        }
        next();
    });
}
exports.validateUsernameExists = validateUsernameExists;
