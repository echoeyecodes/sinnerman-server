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
const express_1 = __importDefault(require("express"));
const comment_middleware_1 = require("../middlewares/comment.middleware");
const generalRequestValidator_1 = __importDefault(require("../utils/generalRequestValidator"));
const comment_controller_1 = __importDefault(require("../controllers/comment.controller"));
const comment_controller = new comment_controller_1.default();
const router = express_1.default.Router();
router.post("/", comment_middleware_1.validateCommentRequest("add"), generalRequestValidator_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { comment, video_id } = req.body;
    const user_id = req.id;
    try {
        const new_comment = yield comment_controller.create({
            comment,
            video_id,
            user_id,
        });
        res.status(200).json(new_comment);
        console.log(new_comment);
    }
    catch (error) {
        console.log(error);
        res.status(400).send("Could not video. Please try again");
    }
}));
router.get("/:id", comment_middleware_1.validateCommentRequest("one"), generalRequestValidator_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { limit = "20", offset = "0" } = req.query;
    try {
        const comments = yield comment_controller.findAll({
            offset: parseInt(offset),
            limit: parseInt(limit),
            where: {
                video_id: id,
            },
        });
        res.status(200).json(comments);
        console.log(comments);
    }
    catch (error) {
        console.log(error);
        res.status(400).send("Could not load comments. Please try again");
    }
}));
exports.default = router;
