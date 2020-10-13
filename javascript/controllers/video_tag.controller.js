"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Video_Tags_1 = __importDefault(require("../models/Video_Tags"));
const GenericController_1 = __importDefault(require("./GenericController"));
class TagController extends GenericController_1.default {
    constructor() {
        super(Video_Tags_1.default);
    }
}
exports.default = TagController;
