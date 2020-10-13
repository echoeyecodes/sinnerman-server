"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = __importDefault(require("../models/User"));
const GenericController_1 = __importDefault(require("./GenericController"));
class UserController extends GenericController_1.default {
    constructor() {
        super(User_1.default);
    }
}
exports.default = UserController;
