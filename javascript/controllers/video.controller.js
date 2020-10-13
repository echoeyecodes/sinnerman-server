"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Video_1 = __importDefault(require("../models/Video"));
const GenericController_1 = __importDefault(require("./GenericController"));
class VideoController extends GenericController_1.default {
    constructor() {
        super(Video_1.default);
    }
}
exports.default = VideoController;
