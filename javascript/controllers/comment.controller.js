"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Comment_1 = __importDefault(require("../models/Comment"));
const GenericController_1 = __importDefault(require("./GenericController"));
class CommentController extends GenericController_1.default {
    constructor() {
        super(Comment_1.default);
    }
}
exports.default = CommentController;
