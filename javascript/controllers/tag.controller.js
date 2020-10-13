"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Tag_1 = __importDefault(require("../models/Tag"));
const GenericController_1 = __importDefault(require("./GenericController"));
class TagController extends GenericController_1.default {
    constructor() {
        super(Tag_1.default);
    }
}
exports.default = TagController;
