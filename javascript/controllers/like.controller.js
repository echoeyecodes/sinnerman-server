"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Like_1 = __importDefault(require("../models/Like"));
const GenericController_1 = __importDefault(require("./GenericController"));
class LikeController extends GenericController_1.default {
    constructor() {
        super(Like_1.default);
    }
}
exports.default = LikeController;
