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
exports.validateVideoFields = exports.validateVideoRequest = void 0;
const express_validator_1 = require("express-validator");
const formidable_1 = __importDefault(require("formidable"));
function validateVideoRequest(type) {
    switch (type) {
        case "one":
            return [
                express_validator_1.param("id").exists(),
                express_validator_1.param("id", "invalid type for parameter id. id must be UUID").isUUID(),
            ];
        case "add":
            return [
                express_validator_1.body("title", "title is required as a body paramter").exists(),
                express_validator_1.body("description", "description is required as a body paramter").exists(),
                express_validator_1.body("video_url", "video_url is required as a body paramter").exists(),
            ];
        default:
            return [];
    }
}
exports.validateVideoRequest = validateVideoRequest;
function validateVideoFields(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const form = new formidable_1.default.IncomingForm();
        form.parse(req, (err, fields, files) => __awaiter(this, void 0, void 0, function* () {
            const path = files.video.path;
            const { title, description } = (fields);
            const requiredparams = { title, description, path };
            const missingParams = Object.entries(requiredparams)
                .filter((entry) => [null, undefined, ""].includes(entry[1]))
                .map((entry) => entry[0]);
            if (missingParams.length > 0) {
                res.status(400).send();
                throw new Error("Couldn't find parameters " + missingParams);
            }
        }));
        next();
    });
}
exports.validateVideoFields = validateVideoFields;
